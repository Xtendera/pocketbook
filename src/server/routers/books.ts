import { protectedProcedure, router } from '~/server/trpc';
import { prisma } from '../prisma';
import z from 'zod';
import path from 'path';
import JSZip from 'jszip';

// This function was rewritten to work with Vercel blob storage and process everything in-memory
// It fetches the EPUB file from the blob URL and extracts the cover image without writing to disk
// We avoid using epub-parser to prevent filesystem operations
export async function getEpubCoverBase64(
  blobUrl: string,
): Promise<string | null> {
  try {
    // Fetch the EPUB file from Vercel blob storage
    const response = await fetch(blobUrl);
    if (!response.ok) {
      console.error(`Failed to fetch EPUB from blob: ${response.statusText}`);
      return null;
    }

    const epubBuffer = Buffer.from(await response.arrayBuffer());
    const zip = await JSZip.loadAsync(epubBuffer);

    // Read container.xml to find the OPF file
    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) {
      console.error('No container.xml found in EPUB');
      return null;
    }

    const containerContent = await containerFile.async('text');
    const opfPathMatch = containerContent.match(/full-path="([^"]+)"/);
    if (!opfPathMatch) {
      console.error('Could not find OPF path in container.xml');
      return null;
    }

    const opfPath = opfPathMatch[1];
    const opfFile = zip.file(opfPath);
    if (!opfFile) {
      console.error(`OPF file not found: ${opfPath}`);
      return null;
    }

    const opfContent = await opfFile.async('text');
    
    // Look for cover image in metadata
    let coverImageId: string | null = null;
    
    // Method 1: Look for meta name="cover" content="..."
    const coverMetaMatch = opfContent.match(/<meta\s+name="cover"\s+content="([^"]+)"/i);
    if (coverMetaMatch) {
      coverImageId = coverMetaMatch[1];
    }

    // Method 2: Look for item with properties="cover-image"
    if (!coverImageId) {
      const coverPropsMatch = opfContent.match(/<item[^>]+properties="[^"]*cover-image[^"]*"[^>]+id="([^"]+)"/i);
      if (coverPropsMatch) {
        coverImageId = coverPropsMatch[1];
      }
    }

    // Method 3: Look for items with common cover names
    if (!coverImageId) {
      const itemMatches = opfContent.matchAll(/<item[^>]+id="([^"]+)"[^>]+href="([^"]+)"/gi);
      for (const match of itemMatches) {
        const href = match[2].toLowerCase();
        if (href.includes('cover') && (href.endsWith('.jpg') || href.endsWith('.jpeg') || href.endsWith('.png') || href.endsWith('.gif'))) {
          coverImageId = match[1];
          break;
        }
      }
    }

    if (!coverImageId) {
      console.error('No cover image ID found in OPF');
      return null;
    }

    // Find the href for this ID - more flexible regex that handles attributes in any order
    let coverHref: string | null = null;
    
    // Look for item with the matching ID and extract href
    const itemMatches = opfContent.matchAll(/<item[^>]*>/gi);
    for (const itemMatch of itemMatches) {
      const itemTag = itemMatch[0];
      
      // Check if this item has the cover ID
      const idMatch = itemTag.match(/id="([^"]+)"/i);
      if (idMatch && idMatch[1] === coverImageId) {
        // Extract href from this item
        const hrefMatch = itemTag.match(/href="([^"]+)"/i);
        if (hrefMatch) {
          coverHref = hrefMatch[1];
          break;
        }
      }
    }

    if (!coverHref) {
      console.error(`Could not find href for cover ID: ${coverImageId}`);
      return null;
    }
    
    // Resolve relative path from OPF directory
    const opfDir = path.dirname(opfPath);
    if (opfDir && opfDir !== '.') {
      coverHref = path.join(opfDir, coverHref).replace(/\\/g, '/');
    }

    // Extract the cover image from the ZIP
    const coverFile = zip.file(coverHref);
    if (!coverFile) {
      console.error(`Cover image file not found: ${coverHref}`);
      return null;
    }

    const coverBuffer = await coverFile.async('nodebuffer');

    const ext = path.extname(coverHref).toLowerCase();
    let mimeType = 'image/jpeg'; // default fallback
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.svg') mimeType = 'image/svg+xml';
    else if (ext === '.webp') mimeType = 'image/webp';

    const base64 = coverBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error extracting EPUB cover:', error);
    return null;
  }
}

export type BookList = {
  uuid: string;
  title: string;
  cover: string;
};

export const booksRouter = router({
  list: protectedProcedure.query(async (): Promise<BookList[]> => {
    const books = await prisma.book.findMany();
    const coveredBooks: BookList[] = await Promise.all(
      books.map(async (item) => {
        if (!item.blobUrl) {
          return {
            uuid: item.uuid,
            title: item.title,
            cover: '',
          };
        }
        const cover = await getEpubCoverBase64(item.blobUrl);
        return {
          uuid: item.uuid,
          title: item.title,
          cover: cover ?? '',
        };
      }),
    );
    return coveredBooks;
  }),
  cover: protectedProcedure
    .input(
      z.object({
        bookID: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      const book = await prisma.book.findUnique({
        where: { uuid: input.bookID },
        select: { blobUrl: true },
      });
      
      if (!book?.blobUrl) {
        return { cover: null };
      }
      
      const cover = await getEpubCoverBase64(book.blobUrl);
      return { cover };
    }),
  progress: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const progress = await prisma.bookProgress.findUnique({
        where: {
          userId_bookUuid: {
            userId: ctx.userId,
            bookUuid: input.bookId,
          },
        },
      });

      return {
        progress: progress?.progress ?? 0,
        progressStr: progress?.progressStr ?? '',
      };
    }),
  updateProgress: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        progress: z.number().min(0),
        progressStr: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const progress = await prisma.bookProgress.upsert({
        where: {
          userId_bookUuid: {
            userId: ctx.userId,
            bookUuid: input.bookId,
          },
        },
        update: {
          progress: input.progress,
          progressStr: input.progressStr,
        },
        create: {
          userId: ctx.userId,
          bookUuid: input.bookId,
          progress: input.progress,
          progressStr: input.progressStr,
        },
      });

      return { success: true, progress: progress.progress };
    }),
  userProgress: protectedProcedure.query(async ({ ctx }) => {
    const progressEntries = await prisma.bookProgress.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        book: true,
      },
    });

    return progressEntries.map((entry) => ({
      bookId: entry.bookUuid,
      bookTitle: entry.book.title,
      progress: entry.progress,
      progressStr: entry.progressStr,
    }));
  }),
});
