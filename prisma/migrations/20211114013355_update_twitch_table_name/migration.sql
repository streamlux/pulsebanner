/*
  Warnings:

  - You are about to drop the `Twitch` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Twitch" DROP CONSTRAINT "Twitch_user_id_fkey";

-- DropTable
DROP TABLE "Twitch";

-- CreateTable
CREATE TABLE "twitch" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "streamUrl" TEXT,
    "tweetInfo" TEXT,

    CONSTRAINT "twitch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "twitch_user_id_unique" ON "twitch"("user_id");

-- AddForeignKey
ALTER TABLE "twitch" ADD CONSTRAINT "twitch_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
