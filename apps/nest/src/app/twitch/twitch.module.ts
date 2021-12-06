import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';
import { TwitterModule } from '../twitter/twitter.module';
import { TwitchAuthService } from './twitch-auth.service';
import { FeaturesModule } from '../features/features.module';

@Module({
    controllers: [TwitchController],
    imports: [HttpModule, TwitterModule, FeaturesModule],
    providers: [TwitchService, TwitchAuthService],
    exports: [TwitchService, TwitchAuthService],
})
export class TwitchModule { }
