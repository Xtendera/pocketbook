import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { extractTokenBody } from '../../utils/jwt';
import { prisma } from '../../server/prisma';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

type BookData = {
  uuid: string;
  title: string;
  originalFilename: string;
  filepath: string;
  blobUrl?: string;
  size: number;
};

type UploadResponse = {
  success: boolean;
  message: string;
  books?: BookData[];
  error?: string;
};

const UPLOAD_DIR = path.join(process.cwd(), 'books');

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function authenticateUser(req: NextApiRequest): Promise<string | null> {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const jwtMatch = cookies.match(/(?:^|; )jwt=([^;]+)/);
  if (!jwtMatch) return null;

  const token = jwtMatch[1];
  const body = await extractTokenBody(token);
  if (!body) return null;

  const week = 24 * 60 * 60 * 1000 * 7;
  const expirationTime = body.iat * 1000 + week;
  if (Date.now() > expirationTime) return null;

  return body.sub;
}

function isEpubFile(filename: string, mimetype?: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ext === '.epub' || mimetype === 'application/epub+zip';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST.',
    });
  }

  try {
    const userUuid = await authenticateUser(req);
    if (!userUuid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    await ensureUploadDir();

    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024,
      maxFiles: 5,
      filter: ({ mimetype, originalFilename }) => {
        return isEpubFile(originalFilename || '', mimetype || '');
      },
      filename: (name, ext) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return `temp-${timestamp}-${random}${ext}`;
      },
    });

    const [fields, files] = await form.parse(req);

    const customTitle = Array.isArray(fields.title)
      ? fields.title[0]
      : fields.title;

    const access = Array.isArray(fields.isPrivate)
      ? fields.isPrivate[0] === 'true'
      : fields.isPrivate === 'true';

    if (!customTitle || !customTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Book title is required.',
      });
    }

    const uploadedBooks = [];

    for (const [, fileArray] of Object.entries(files)) {
      if (Array.isArray(fileArray)) {
        for (const file of fileArray) {
          if (!isEpubFile(file.originalFilename || '', file.mimetype || '')) {
            await fs.unlink(file.filepath);
            continue;
          }

          try {
            const title = customTitle.trim();
            let book;

            // Check if we should use Vercel Blob storage
            if (process.env.BLOB_READ_WRITE_TOKEN) {
              const fileBuffer = await fs.readFile(file.filepath);

              // Upload to Vercel Blob
              const blob = await put(
                `${Date.now()}-${file.originalFilename}`,
                fileBuffer,
                {
                  access: 'public',
                  contentType: file.mimetype || 'application/epub+zip',
                },
              );

              if (access) {
                book = await prisma.book.create({
                  data: {
                    title,
                    blobUrl: blob.url,
                    authorizedUsers: {
                      connect: {
                        uuid: userUuid,
                      },
                    },
                  },
                });
              } else {
                book = await prisma.book.create({
                  data: {
                    title,
                    blobUrl: blob.url,
                  },
                });
              }

              // Clean up the temporary file
              await fs.unlink(file.filepath);

              uploadedBooks.push({
                uuid: book.uuid,
                title: book.title,
                originalFilename: file.originalFilename || 'unknown.epub',
                filepath: '', // No local filepath when using blob storage
                blobUrl: blob.url,
                size: file.size,
              });
            } else {
              // Use normal file storage
              if (access) {
                book = await prisma.book.create({
                  data: {
                    title,
                    authorizedUsers: {
                      connect: {
                        uuid: userUuid,
                      },
                    },
                  },
                });
              } else {
                book = await prisma.book.create({
                  data: {
                    title,
                  },
                });
              }

              const newFilepath = path.join(UPLOAD_DIR, `${book.uuid}.epub`);
              await fs.rename(file.filepath, newFilepath);

              uploadedBooks.push({
                uuid: book.uuid,
                title: book.title,
                originalFilename: file.originalFilename || 'unknown.epub',
                filepath: newFilepath,
                size: file.size,
              });
            }
          } catch (error) {
            await fs.unlink(file.filepath);
            console.error('Error processing file:', error);
            continue;
          }
        }
      }
    }

    if (uploadedBooks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid EPUB files were uploaded.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadedBooks.length} book(s).`,
      books: uploadedBooks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during file upload.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
