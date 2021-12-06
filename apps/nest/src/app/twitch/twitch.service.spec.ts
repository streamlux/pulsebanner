import { Test } from '@nestjs/testing';
import { TwitchService } from './twitch.service';

describe('ApiTwitchService', () => {
    let service: TwitchService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [TwitchService],
        }).compile();

        service = module.get(TwitchService);
    });

    it('should be defined', () => {
        expect(service).toBeTruthy();
    });
});
