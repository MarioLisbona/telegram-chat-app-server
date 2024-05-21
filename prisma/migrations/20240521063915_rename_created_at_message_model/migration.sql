/*
  Warnings:

  - You are about to drop the column `datetime` on the `messages` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "messages",
RENAME COLUMN "datetime" TO "createdAt" TIMESTAMP(3) NOT NULL;
