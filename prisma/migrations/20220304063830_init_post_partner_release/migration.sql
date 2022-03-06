-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('recurring', 'one_time');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid');

-- CreateEnum
CREATE TYPE "PriceInterval" AS ENUM ('day', 'month', 'week', 'year');

-- CreateEnum
CREATE TYPE "AcceptanceStatus" AS ENUM ('active', 'pending', 'suspended', 'rejected');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('complete', 'waitPeriod', 'pendingCompletion', 'pending', 'rejected', 'pendingRejection', 'none');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "oauth_token_secret" TEXT,
    "oauth_token" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" NOT NULL DEFAULT E'user',
    "partner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "foregroundId" TEXT NOT NULL,
    "backgroundId" TEXT NOT NULL,
    "backgroundProps" JSONB NOT NULL,
    "foregroundProps" JSONB NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tweets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tweets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twitch" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "streamUrl" TEXT,
    "tweetInfo" TEXT,

    CONSTRAINT "twitch_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "profile_img" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "foregroundId" TEXT NOT NULL,
    "backgroundId" TEXT NOT NULL,
    "backgroundProps" JSONB NOT NULL,
    "foregroundProps" JSONB NOT NULL,

    CONSTRAINT "profile_img_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rendered_profile_img" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_rendered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rendered_profile_img_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_information" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,

    CONSTRAINT "partner_information_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL,
    "interval" "PriceInterval",
    "unit_amount" INTEGER,
    "interval_count" INTEGER,
    "trial_period_days" INTEGER,
    "type" "PriceType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "start_date" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "trial_start" TIMESTAMP(3),
    "cancel_at" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN,
    "canceled_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "partnerCode" TEXT NOT NULL,
    "notes" TEXT,
    "acceptanceStatus" "AcceptanceStatus" NOT NULL,

    CONSTRAINT "partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_partner_info" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "stripePromoCode" TEXT NOT NULL,

    CONSTRAINT "stripe_partner_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_invoice" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "partnerId" TEXT,
    "balanceTransactionId" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "commissionAmount" INTEGER NOT NULL,
    "purchaseAmount" INTEGER NOT NULL,
    "commissionStatus" "CommissionStatus" NOT NULL,

    CONSTRAINT "partner_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_requests_token_key" ON "verification_requests"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_requests_identifier_token_key" ON "verification_requests"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "banners_user_id_unique" ON "banners"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tweets_user_id_unique" ON "tweets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "twitch_user_id_unique" ON "twitch"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "twitter_username_user_id_unique" ON "username"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "twitter_original_username_user_id_unique" ON "original_name"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "twitter_profile_picture" ON "profile_img"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rendered_profile_img_user_id_key" ON "rendered_profile_img"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_information_user_id_key" ON "partner_information"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_information_partner_id_key" ON "partner_information"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "live_streams_user_id_key" ON "live_streams"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_user_id_unique" ON "customers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_unique" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_email_key" ON "partner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partner_partnerCode_key" ON "partner"("partnerCode");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_partner_info_partnerId_key" ON "stripe_partner_info"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_partner_info_stripePromoCode_key" ON "stripe_partner_info"("stripePromoCode");

-- CreateIndex
CREATE UNIQUE INDEX "partner_invoice_id_key" ON "partner_invoice"("id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twitch" ADD CONSTRAINT "twitch_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "username" ADD CONSTRAINT "username_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "original_name" ADD CONSTRAINT "original_name_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_img" ADD CONSTRAINT "profile_img_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendered_profile_img" ADD CONSTRAINT "rendered_profile_img_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_information" ADD CONSTRAINT "partner_information_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_information" ADD CONSTRAINT "partner_information_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_streams" ADD CONSTRAINT "live_streams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "past_streams" ADD CONSTRAINT "past_streams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "prices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_partner_info" ADD CONSTRAINT "stripe_partner_info_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_invoice" ADD CONSTRAINT "partner_invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_invoice" ADD CONSTRAINT "partner_invoice_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
