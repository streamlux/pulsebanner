/*
  Warnings:

  - You are about to drop the column `original_image` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "banners" DROP COLUMN "original_image";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "image";
