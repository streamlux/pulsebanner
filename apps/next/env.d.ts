
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TWITCH_CLIENT_ID: string;
            TWITCH_CLIENT_SECRET: string;
            DATABASE_URL: string;
            POSTGRES_PASSWORD: string;
            TWITTER_ID: string;
            TWITTER_SECRET: string;
            EVENTSUB_CALLBACK_DOMAIN: string;
            SECRET: string;
            /**
             * Ok to use this on frontend
             */
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
            STRIPE_SECRET_KEY: string;
            STRIPE_WEBHOOK_SECRET_LIVE: string;
            STRIPE_WEBHOOK_SECRET: string;
            EVENTSUB_SECRET: string;
            APP_DOMAIN: string;
            ADMINER_URL: string;
            ANALYTICS_URL: string;
            REMOTION_URL: string;
            DO_ACCESS_KEY: string;
            DO_SECRET: string;
            DO_SPACE_ENDPOINT: string;
            REVUE_API_KEY: string;
            ENABLE_WEBHOOK_LOCAL_TESTING: string;
            ENABLE_DISCORD_WEBHOOKS: string;
            DISCORD_WEBHOOK_URL: string;
            DISCORD_BANNER_DISABLED_WEBHOOK_URL: string;
            DISCORD_ERROR_WEBHOOK_URL: string;
            DISCORD_LOGS_WEBHOOK_URL: string;
            IMAGE_BUCKET_NAME: string;
            BANNER_BACKUP_BUCKET: string;
            PROFILE_PIC_BUCKET_NAME: string;
            PROFILE_PIC_BACKUP_BUCKET: string;
            PROFILE_PIC_CACHE_BUCKET: string;
            LEADDYNO_API_KEY: string;
            DATADOG_API_KEY: string;
            SERVICE_ENV: string;
            DISCORD_NEW_SUBSCRIBER_URL: string;
            DISCORD_CANCELLED_SUBSCRIBER_URL: string;
            STRIPE_AFFILIATE_COUPON: string;
            STRIPE_AFFILIATE_WEBHOOK_SECRET: string;
            STRIPE_DASHBOARD_BASEURL: string;
            NODEMAILER_API_KEY: string;
            NODEMAILER_DOMAIN: string;
            DISCORD_GIFT_PURCHASED_URL: string;
            BUILD_TARGET?: 'staging' | 'production' | 'local';
        }
    }
}

export {}
