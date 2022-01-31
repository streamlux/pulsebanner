-- CreateTable
CREATE TABLE "affiliate_information" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "affiliateId" INTEGER NOT NULL,

    CONSTRAINT "affiliate_information_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_information_user_id_key" ON "affiliate_information"("user_id");

-- AddForeignKey
ALTER TABLE "affiliate_information" ADD CONSTRAINT "affiliate_information_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
