-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('ACTIVE', 'PENDING', 'DELETED');

-- CreateTable
CREATE TABLE "MediaFiel" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desctiption" TEXT,
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

    CONSTRAINT "MediaFiel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MediaFiel" ADD CONSTRAINT "MediaFiel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
