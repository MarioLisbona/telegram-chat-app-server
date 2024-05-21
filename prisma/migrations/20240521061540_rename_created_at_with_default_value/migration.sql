/*
  Warnings:

  - You are about to drop the column `datetime` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "messages"
RENAME COLUMN "datetime" TO "createdAt";

ALTER TABLE "messages"
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;