-- CreateTable
CREATE TABLE "public"."BookProgress" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bookUuid" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "progressStr" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "BookProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookProgress_userId_bookUuid_key" ON "public"."BookProgress"("userId", "bookUuid");

-- AddForeignKey
ALTER TABLE "public"."BookProgress" ADD CONSTRAINT "BookProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookProgress" ADD CONSTRAINT "BookProgress_bookUuid_fkey" FOREIGN KEY ("bookUuid") REFERENCES "public"."Book"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
