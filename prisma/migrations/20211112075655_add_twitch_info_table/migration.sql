-- CreateTable
CREATE TABLE "Twitch" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "streamUrl" TEXT,
    "tweetInfo" TEXT,

    CONSTRAINT "Twitch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "twitch_user_id_unique" ON "Twitch"("user_id");

-- AddForeignKey
ALTER TABLE "Twitch" ADD CONSTRAINT "Twitch_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
