/*
  Warnings:

  - You are about to drop the column `originalName` on the `original_name` table. All the data in the column will be lost.
  - You are about to drop the column `streamName` on the `username` table. All the data in the column will be lost.
  - Added the required column `original_name` to the `original_name` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stream_name` to the `username` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "original_name" DROP COLUMN "originalName",
ADD COLUMN     "original_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "username" DROP COLUMN "streamName",
ADD COLUMN     "stream_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
