import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { TwitchModule } from '../twitch/twitch.module';
import { TwitterModule } from '../twitter/twitter.module';
import { BannerController } from './banner.controller';

@Module({
    imports: [PrismaModule, TwitterModule, StorageModule, TwitchModule, StorageModule],
    controllers: [BannerController],
    providers: []
})
export class BannerModule { }
