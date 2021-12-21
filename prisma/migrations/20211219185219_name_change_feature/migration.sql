-- CreateTable
CREATE TABLE "username" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "stream_name" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "username_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "original_name" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,

    CONSTRAINT "original_name_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "twitter_username_user_id_unique" ON "username"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "twitter_original_username_user_id_unique" ON "original_name"("user_id");

-- AddForeignKey
ALTER TABLE "username" ADD CONSTRAINT "username_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "original_name" ADD CONSTRAINT "original_name_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
