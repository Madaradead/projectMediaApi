/*
  Warnings:

  - You are about to drop the `MediaFiel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MediaFiel" DROP CONSTRAINT "MediaFiel_ownerId_fkey";

-- DropTable
DROP TABLE "MediaFiel";

-- CreateTable
CREATE TABLE "MediaFile" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "MediaType" NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "MediaStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAT" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAT" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MediaFile" ADD CONSTRAINT "MediaFile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
