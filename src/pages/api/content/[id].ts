import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../../server/prisma';
import { extractTokenBody } from '../../../utils/jwt';
import { parseJwtFromCookieString } from '../../../utils/cookies';

async function authenticateUser(req: NextApiRequest): Promise<string | null> {
  const cookies = req.headers.cookie;

  const token = parseJwtFromCookieString(cookies);
  if (!token) return null;

  const body = await extractTokenBody(token);
  if (!body) return null;

  const week = 24 * 60 * 60 * 1000 * 7;
  const expirationTime = body.iat * 1000 + week;
  if (Date.now() > expirationTime) return null;

  return body.user;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET.',
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

    const { id } = req.query;

    // Extract UUID from the filename (remove .epub extension if present)
    let bookId = id;
    if (typeof id === 'string' && id.endsWith('.epub')) {
      bookId = id.slice(0, -5); // Remove .epub extension
    }

    if (!bookId || typeof bookId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID provided.',
      });
    }

    const book = await prisma.book.findUnique({
      where: { uuid: bookId },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.' + bookId,
      });
    }

    // Check if we should use Vercel Blob storage
    if (process.env.BLOB_READ_WRITE_TOKEN && book.blobUrl) {
      // Fetch the file from Vercel Blob storage
      const response = await fetch(book.blobUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch file from blob storage');
      }

      const fileBuffer = await response.arrayBuffer();

      res.setHeader('Content-Type', 'application/epub+zip');
      res.setHeader('Content-Length', fileBuffer.byteLength.toString());
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${book.title}.epub"`,
      );
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

      return res.send(Buffer.from(fileBuffer));
    } else {
      // Use normal file storage
      const filePath = path.join(process.cwd(), 'books', `${bookId}.epub`);

      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'Book not found.' + bookId,
        });
      }

      const stats = await fs.stat(filePath);

      res.setHeader('Content-Type', 'application/epub+zip');
      res.setHeader('Content-Length', stats.size.toString());
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${book.title}.epub"`,
      );
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

      const fileBuffer = await fs.readFile(filePath);
      return res.send(fileBuffer);
    }
  } catch (error) {
    console.error('Error serving EPUB file:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching book.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
