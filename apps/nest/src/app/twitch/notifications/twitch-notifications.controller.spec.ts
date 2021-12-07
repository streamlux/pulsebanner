import { Test } from '@nestjs/testing';
import { TwitchNotificationsController } from './twitch-notifications.controller';
import { TwitchNotificationsService } from './twitch-notifications.service';

describe('NotificationsController', () => {
    let controller: TwitchNotificationsController;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [TwitchNotificationsService],
            controllers: [TwitchNotificationsController],
        }).compile();

        controller = module.get(TwitchNotificationsController);
    });

    it('should be defined', () => {
        expect(controller).toBeTruthy();
    });
});
