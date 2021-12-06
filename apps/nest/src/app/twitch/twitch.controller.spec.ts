import { Test } from '@nestjs/testing';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';

describe('TwitchController', () => {
    let controller: TwitchController;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [TwitchService],
            controllers: [TwitchController],
        }).compile();

        controller = module.get(TwitchController);
    });

    it('should be defined', () => {
        expect(controller).toBeTruthy();
    });
});
