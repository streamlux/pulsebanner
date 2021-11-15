/*
  Warnings:

  - You are about to drop the column `template_id` on the `banners` table. All the data in the column will be lost.
  - Added the required column `backgroundId` to the `banners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `backgroundProps` to the `banners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foregroundId` to the `banners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foregroundProps` to the `banners` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banners" DROP COLUMN "template_id",
ADD COLUMN     "backgroundId" TEXT NOT NULL,
ADD COLUMN     "backgroundProps" JSONB NOT NULL,
ADD COLUMN     "foregroundId" TEXT NOT NULL,
ADD COLUMN     "foregroundProps" JSONB NOT NULL;
