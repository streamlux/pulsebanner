import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TwitchApiModule } from '../twitch/api/twitch-api.module';
import { FeaturesService } from './features.service';

@Module({
    providers: [FeaturesService],
    exports: [FeaturesService],
    imports: [HttpModule, PrismaModule, TwitchApiModule]
})
export class FeaturesModule { }
