-- CreateTable
CREATE TABLE "live_streams" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "streamLink" TEXT,
    "twitterLink" TEXT,
    "twitchUserId" TEXT,
    "twitchStreamId" TEXT,
    "startTime" TIMESTAMP(3),

    CONSTRAINT "live_streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "past_streams" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "twitchUserId" TEXT,
    "twitchStreamId" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),

    CONSTRAINT "past_streams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "live_streams_user_id_key" ON "live_streams"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "past_streams_user_id_key" ON "past_streams"("user_id");

-- AddForeignKey
ALTER TABLE "live_streams" ADD CONSTRAINT "live_streams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "past_streams" ADD CONSTRAINT "past_streams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
