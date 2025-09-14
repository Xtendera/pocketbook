# Pocket Book

A small ebook reader for on-the-go. Made to support multiple users with both shared and private ebooks/collections.

# Setup

This project requires a Postgres-compatible database running at a URL specified in the .env file.

I suggest using bun to deploy, however it is possible to use NodeJS and Yarn as well.

```bash
bun install
bun run build
bun run dev
```

# Credits

This project uses many web technologies, notably NextJS, tRPC, Zod, and Prisma. Credit for these and the libraries specified in `package.json` goes to the respective authors.
