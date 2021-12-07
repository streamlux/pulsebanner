import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwitchNotificationsController } from './twitch-notifications.controller';
import { TwitchNotificationsService } from './twitch-notifications.service';
import { TwitterModule } from '../../twitter/twitter.module';
import { FeaturesModule } from '../../features/features.module';
import { TwitchAuthModule } from '../auth/twitch-auth.module';

@Module({
    controllers: [TwitchNotificationsController],
    imports: [HttpModule, TwitterModule, FeaturesModule, TwitchAuthModule],
    providers: [TwitchNotificationsService],
    exports: [TwitchNotificationsService],
})
export class TwitchNotificationsModule { }
