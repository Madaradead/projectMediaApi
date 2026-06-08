/*
  Warnings:

  - You are about to drop the column `createdAT` on the `MediaFile` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAT` on the `MediaFile` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `MediaFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

ALTER TABLE "MediaFile" RENAME COLUMN "createdAT" TO "createdAt";
ALTER TABLE "MediaFile" RENAME COLUMN "updatedAT" TO "updatedAt";
