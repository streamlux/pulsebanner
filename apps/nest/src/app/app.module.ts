import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SessionService } from './auth/session.service';
import { PrismaService } from './prisma/prisma.service';

import { BannerModule } from './banner/banner.module';
import { FeaturesModule } from './features/features.module';
import { StorageModule } from './storage/storage.module';
import { TwitchModule } from './twitch/twitch.module';
import { TwitterModule } from './twitter/twitter.module';

@Module({
    imports: [
        HttpModule,
        BannerModule,
        FeaturesModule,
        TwitterModule,
        StorageModule,
        TwitchModule,
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid('development', 'production', 'test', 'provision')
                    .default('development'),
                EVENTSUB_SECRET: Joi.string().max(100).min(10).required(),
                TWITCH_CLIENT_ID: Joi.string().required(),
                TWITTER_ID: Joi.string().required(),
                TWITTER_SECRET: Joi.string().required(),
            }),
        })],
    controllers: [AppController],
    providers: [SessionService, AppService, PrismaService],
})
export class AppModule { }
