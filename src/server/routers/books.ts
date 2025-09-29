import { protectedProcedure, router } from '~/server/trpc';
import { prisma } from '../prisma';
import z from 'zod';
import path from 'path';
import JSZip from 'jszip';
import fs from 'fs/promises';

// This function was taken from a TON of snippets and examples on the internet, and a small amount of AI.
// I am not sure why this function works, I might have to rewrite it soon with a custom library instead of using all of this.
export async function getEpubCoverBase64(
  epubPathOrBlobUrl: string,
  isBlob?: boolean,
): Promise<string | null> {
  try {
    let epubBuffer: Buffer;

    if (isBlob) {
      // Fetch from Vercel Blob storage
      const response = await fetch(epubPathOrBlobUrl);
      if (!response.ok) {
        console.error(`Failed to fetch EPUB from blob: ${response.statusText}`);
        return null;
      }
      epubBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      // Read from local file system
      epubBuffer = await fs.readFile(epubPathOrBlobUrl);
    }

    const zip = await JSZip.loadAsync(epubBuffer);

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

    let coverImageId: string | null = null;

    const coverMetaMatch = opfContent.match(
      /<meta\s+name="cover"\s+content="([^"]+)"/i,
    );
    if (coverMetaMatch) {
      coverImageId = coverMetaMatch[1];
    }

    if (!coverImageId) {
      const coverPropsMatch = opfContent.match(
        /<item[^>]+properties="[^"]*cover-image[^"]*"[^>]+id="([^"]+)"/i,
      );
      if (coverPropsMatch) {
        coverImageId = coverPropsMatch[1];
      }
    }

    if (!coverImageId) {
      const itemMatches = opfContent.matchAll(
        /<item[^>]+id="([^"]+)"[^>]+href="([^"]+)"/gi,
      );
      for (const match of itemMatches) {
        const href = match[2].toLowerCase();
        if (
          href.includes('cover') &&
          (href.endsWith('.jpg') ||
            href.endsWith('.jpeg') ||
            href.endsWith('.png') ||
            href.endsWith('.gif'))
        ) {
          coverImageId = match[1];
          break;
        }
      }
    }

    if (!coverImageId) {
      console.error('No cover image ID found in OPF');
      return null;
    }

    let coverHref: string | null = null;

    const itemMatches = opfContent.matchAll(/<item[^>]*>/gi);
    for (const itemMatch of itemMatches) {
      const itemTag = itemMatch[0];

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

    const opfDir = path.dirname(opfPath);
    if (opfDir && opfDir !== '.') {
      coverHref = path.join(opfDir, coverHref).replace(/\\/g, '/');
    }

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

const headers = new Headers({
  'User-Agent': 'PocketBook/1.0 (geektraindev@gmail.com)',
});

const olSchema = z.object({
  title: z.string(),
});

export const booksRouter = router({
  list: protectedProcedure.query(async ({ ctx }): Promise<BookList[]> => {
    const books = await prisma.book.findMany({
      where: {
        OR: [
          {
            authorizedUsers: {
              none: {},
            },
          },
          {
            authorizedUsers: {
              some: {
                uuid: ctx.userId,
              },
            },
          },
        ],
      },
    });
    const coveredBooks: BookList[] = await Promise.all(
      books.map(async (item) => {
        let cover: string | null = null;

        // Check if we should use Vercel Blob storage
        if (process.env.BLOB_READ_WRITE_TOKEN && item.blobUrl) {
          cover = await getEpubCoverBase64(item.blobUrl, true);
        } else {
          const bookPath = path.join(
            process.cwd(),
            'books',
            `${item.uuid}.epub`,
          );
          cover = await getEpubCoverBase64(bookPath, false);
        }

        return {
          uuid: item.uuid,
          title: item.title,
          cover: cover ?? '',
        };
      }),
    );
    return coveredBooks;
  }),
  listCollections: protectedProcedure.query(async () => {
    const collections = await prisma.collection.findMany({
      select: {
        uuid: true,
        name: true,
        books: {
          select: {
            uuid: true,
            title: true,
          },
        },
      },
    });
    if (collections) {
      return {
        success: true,
        collections: collections,
      };
    } else {
      return {
        success: false,
        collections: null,
      };
    }
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
  getCollection: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const collection = await prisma.collection.findUnique({
        where: { uuid: input.id },
        include: {
          books: {
            select: {
              uuid: true,
              title: true,
            },
          },
        },
      });

      if (!collection) {
        throw new Error('Collection not found');
      }

      return collection;
    }),
  createCollection: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        bookIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      const collection = await prisma.collection.create({
        data: {
          name: input.name,
          books: {
            connect: input.bookIds.map((id) => ({ uuid: id })),
          },
        },
        include: {
          books: {
            select: {
              uuid: true,
              title: true,
            },
          },
        },
      });

      return {
        success: true,
        collection,
      };
    }),
  searchID: protectedProcedure
    .input(z.string().nonempty().min(9).max(13))
    .query(async ({ input }) => {
      if (input.slice(0, 2) === 'OL' && input.slice(-1) === 'W') {
        // OpenLibrary ID
        const dataRaw = await fetch(
          `https://openlibrary.org/works/${input}.json`,
          {
            method: 'GET',
            headers: headers,
          },
        );

        if (!dataRaw.ok) {
          return {
            success: false,
            message: `HTTP error: ${dataRaw.status} ${dataRaw.statusText}`,
            title: '',
            desc: '',
          };
        }

        const jsonData = await dataRaw.json();
        const data = olSchema.safeParse(jsonData);
        if (!data.success) {
          return {
            success: false,
            message: 'Invalid response format from OpenLibrary API',
            title: '',
            desc: '',
          };
        }
        return {
          success: true,
          message: '',
          title: data.data.title,
        };
      } else if (input.length === 13 || input.length === 10) {
        // ISBN ID (Currently API-Bricked)
        return {
          success: false,
          message: 'Unsupported ID type!',
          title: '',
          desc: '',
        };
      } else {
        return {
          success: false,
          message: 'Invalid ID!',
          title: '',
          desc: '',
        };
      }
    }),
});
