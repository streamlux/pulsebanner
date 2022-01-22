/*
  Warnings:

  - You are about to drop the `ProfilePic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfilePicRendered` table. If the table is not empty, all the data it contains will be lost.

*/
-- -- DropForeignKey
-- ALTER TABLE "ProfilePic" DROP CONSTRAINT "ProfilePic_user_id_fkey";

-- -- DropForeignKey
-- ALTER TABLE "ProfilePicRendered" DROP CONSTRAINT "ProfilePicRendered_user_id_fkey";

-- DropIndex
DROP INDEX "past_streams_user_id_key";

-- -- DropTable
-- DROP TABLE "ProfilePic";

-- -- DropTable
-- DROP TABLE "ProfilePicRendered";

-- CreateTable
-- CREATE TABLE "profile_img" (
--     "id" TEXT NOT NULL,
--     "user_id" TEXT NOT NULL,
--     "enabled" BOOLEAN NOT NULL DEFAULT false,
--     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "foregroundId" TEXT NOT NULL,
--     "backgroundId" TEXT NOT NULL,
--     "backgroundProps" JSONB NOT NULL,
--     "foregroundProps" JSONB NOT NULL,

--     CONSTRAINT "profile_img_pkey" PRIMARY KEY ("id")
-- );

-- CreateTable
-- CREATE TABLE "rendered_profile_img" (
--     "id" TEXT NOT NULL,
--     "user_id" TEXT NOT NULL,
--     "last_rendered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     CONSTRAINT "rendered_profile_img_pkey" PRIMARY KEY ("id")
-- );

-- CreateIndex
-- CREATE UNIQUE INDEX "twitter_profile_picture" ON "profile_img"("user_id");

-- CreateIndex
-- CREATE UNIQUE INDEX "rendered_profile_img_user_id_key" ON "rendered_profile_img"("user_id");

-- AddForeignKey
-- ALTER TABLE "profile_img" ADD CONSTRAINT "profile_img_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE "rendered_profile_img" ADD CONSTRAINT "rendered_profile_img_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
