-- CreateTable
CREATE TABLE "ProfilePic" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "foregroundId" TEXT NOT NULL,
    "backgroundId" TEXT NOT NULL,
    "backgroundProps" JSONB NOT NULL,
    "foregroundProps" JSONB NOT NULL,

    CONSTRAINT "ProfilePic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilePicRendered" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_rendered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfilePicRendered_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "twitter_profile_picture" ON "ProfilePic"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_picture_rendered" ON "ProfilePicRendered"("user_id");

-- AddForeignKey
ALTER TABLE "ProfilePic" ADD CONSTRAINT "ProfilePic_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePicRendered" ADD CONSTRAINT "ProfilePicRendered_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
