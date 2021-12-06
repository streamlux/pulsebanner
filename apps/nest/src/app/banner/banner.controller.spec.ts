import { Test } from '@nestjs/testing';
import { BannerController } from './banner.controller';
import { FeaturesService } from '../features/features.service';

describe('BannerController', () => {
    let controller: BannerController;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [FeaturesService],
            controllers: [BannerController],
        }).compile();

        controller = module.get(BannerController);
    });

    it('should be defined', () => {
        expect(controller).toBeTruthy();
    });
});
