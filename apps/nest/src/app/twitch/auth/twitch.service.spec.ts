import { Test } from '@nestjs/testing';
import { TwitchNotificationsService } from '../notifications/twitch-notifications.service';

describe('ApiTwitchService', () => {
    let service: TwitchNotificationsService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [TwitchNotificationsService],
        }).compile();

        service = module.get(TwitchNotificationsService);
    });

    it('should be defined', () => {
        expect(service).toBeTruthy();
    });
});
