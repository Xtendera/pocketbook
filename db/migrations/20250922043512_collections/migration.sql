-- CreateTable
CREATE TABLE "public"."Collection" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "public"."_BookToCollection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookToCollection_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BookToCollection_B_index" ON "public"."_BookToCollection"("B");

-- AddForeignKey
ALTER TABLE "public"."_BookToCollection" ADD CONSTRAINT "_BookToCollection_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Book"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BookToCollection" ADD CONSTRAINT "_BookToCollection_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Collection"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
