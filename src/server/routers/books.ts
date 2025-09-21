import { protectedProcedure, router } from '~/server/trpc';
import { prisma } from '../prisma';
import z from 'zod';
import { initEpubFile } from '@lingo-reader/epub-parser';
import path from 'path';
import JSZip from 'jszip';
import fs from 'fs/promises';

// This function was taken from a TON of snippets and examples on the internet, and a small amount of AI.
// I am not sure why this function works, I might have to rewrite it soon with a custom library instead of using all of this.
export async function getEpubCoverBase64(
  epubPath: string,
): Promise<string | null> {
  try {
    const epubBuffer = await fs.readFile(epubPath);
    const zip = await JSZip.loadAsync(epubBuffer);

    const epub = await initEpubFile(epubPath);

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
  } catch {
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
        const bookPath = path.join(process.cwd(), 'books', `${item.uuid}.epub`);
        const cover = await getEpubCoverBase64(bookPath);
        return {
          uuid: item.uuid,
          title: item.title,
          cover: cover ?? '',
        };
      }),
    );
    return coveredBooks;
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
