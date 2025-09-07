import { publicProcedure, router } from "~/server/trpc";
import { prisma } from "../prisma";
import z from "zod";
import { initEpubFile } from "@lingo-reader/epub-parser";
import path from "path";
import JSZip from "jszip";
import fs from "fs/promises";

// This function was taken from a TON of snippets and examples on the internet, and a small amount of AI.
// I am not sure why this function works, I might have to rewrite it soon with a custom library instead of using all of this.
export async function getEpubCoverBase64(epubPath: string): Promise<string | null> {
  try {
    const epubBuffer = await fs.readFile(epubPath);
    const zip = await JSZip.loadAsync(epubBuffer);
    
    const epub = await initEpubFile(epubPath);
    
    const guide = epub.getGuide();
    const coverRef = guide.find(item => item.type === "cover" || item.type === "cover-image");

    const manifest = epub.getManifest();
    let coverItem = coverRef
      ? Object.values(manifest).find(item => item.href === coverRef.href)
      : Object.values(manifest).find(item => item.properties?.includes("cover-image"));

    if (!coverItem) return null;

    const zipFile = zip.file(coverItem.href);
    if (!zipFile) return null;
    
    const coverBuffer = await zipFile.async("nodebuffer");

    const ext = path.extname(coverItem.href).toLowerCase();
    let mimeType = "image/jpeg"; // default fallback
    if (ext === ".png") mimeType = "image/png";
    else if (ext === ".gif") mimeType = "image/gif";
    else if (ext === ".svg") mimeType = "image/svg+xml";
    else if (ext === ".webp") mimeType = "image/webp";

    const base64 = coverBuffer.toString("base64");
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    return null;
  }
}

const bookListSchema = z.object({
    uuid: z.string(),
    title: z.string()
});

export type BookList = z.infer<typeof bookListSchema>;

export const booksRouter = router({
    list: publicProcedure.query(
        async (): Promise<BookList[]> => {
            const books = await prisma.book.findMany();
            return books;
        }
    ),
    cover: publicProcedure.input(
        z.object({
            bookID: z.string().nonempty()
        })
    ).query(
        async ({ input }) => {
            const bookPath = path.join(process.cwd(), 'books', `${input.bookID}.epub`);
            const cover = await getEpubCoverBase64(bookPath);
            return { cover };
        }
    )
});