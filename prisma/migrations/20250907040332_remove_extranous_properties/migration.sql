/*
  Warnings:

  - You are about to drop the column `author` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `identifier` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publishDate` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publisher` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Book" DROP COLUMN "author",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "identifier",
DROP COLUMN "language",
DROP COLUMN "publishDate",
DROP COLUMN "publisher",
DROP COLUMN "subject",
DROP COLUMN "updatedAt";
