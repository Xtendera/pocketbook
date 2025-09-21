-- CreateTable
CREATE TABLE "public"."_BookAccess" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BookAccess_B_index" ON "public"."_BookAccess"("B");

-- AddForeignKey
ALTER TABLE "public"."_BookAccess" ADD CONSTRAINT "_BookAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Book"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BookAccess" ADD CONSTRAINT "_BookAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
