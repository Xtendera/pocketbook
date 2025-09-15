import { protectedProcedure, router } from '~/server/trpc';
import { prisma } from '../prisma';
import z from 'zod';
import { initEpubFile } from '@lingo-reader/epub-parser';
import path from 'path';
import JSZip from 'jszip';
import fs from 'fs/promises';

// This function was rewritten to work with Vercel blob storage and process everything in-memory
// It fetches the EPUB file from the blob URL and extracts the cover image without writing to disk
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

    // Create a temporary file path for epub-parser (it needs a file path, not buffer)
    const tempPath = `/tmp/temp-${Date.now()}.epub`;
    await fs.writeFile(tempPath, epubBuffer);

    try {
      const epub = await initEpubFile(tempPath);

      const guide = epub.getGuide();
      const coverRef = guide.find(
        (item) => item.type === 'cover' || item.type === 'cover-image',
      );

      const manifest = epub.getManifest();
      const coverItem = coverRef
        ? Object.values(manifest).find((item) => item.href === coverRef.href)
        : Object.values(manifest).find((item) =>
            item.properties?.includes('cover-image'),
          );

      if (!coverItem) return null;

      const zipFile = zip.file(coverItem.href);
      if (!zipFile) return null;

      const coverBuffer = await zipFile.async('nodebuffer');

      const ext = path.extname(coverItem.href).toLowerCase();
      let mimeType = 'image/jpeg'; // default fallback
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.svg') mimeType = 'image/svg+xml';
      else if (ext === '.webp') mimeType = 'image/webp';

      const base64 = coverBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    } finally {
      // Clean up the temporary file
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
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
