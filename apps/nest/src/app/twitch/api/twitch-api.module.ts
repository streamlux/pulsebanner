import { Module } from '@nestjs/common';
import { TwitchAuthModule } from '../auth/twitch-auth.module';
import { TwitchApiService } from './twitch-api.service';

@Module({
    imports: [TwitchAuthModule],
    providers: [TwitchApiService],
    exports: [TwitchApiService]
})
export class TwitchApiModule { }
