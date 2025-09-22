# Pocket Book

A small ebook reader for on-the-go. Made to support multiple users with both shared and private ebooks/collections.

# Setup

This project requires a Postgres-compatible database running at a URL specified in the .env file. You should also have a randomly generated JWT key that is 64 bytes long. DEMO mode can be enabled if running in that environment.

## Vercel Deployment

This project will require the BLOB_READ_WRITE_TOKEN environment variable set to run under vercel, using a provided vercel blob storage key.

## Custom Deployment

I suggest using bun to deploy, however it is possible to use NodeJS and Yarn as well.

```bash
bun install
# Optionally, you can run this to put contents from .env.local into your shell: export $(grep -v '^#' .env.local | xargs)
bun run build
bun run dev
```

# Credits

This project uses many web technologies, notably NextJS, tRPC, Zod, and Prisma. Credit for these and the libraries specified in `package.json` goes to the respective authors.
