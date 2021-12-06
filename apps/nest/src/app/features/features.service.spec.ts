import { Test } from '@nestjs/testing';
import { FeaturesService } from './features.service';

describe('FeaturesService', () => {
    let service: FeaturesService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [FeaturesService],
        }).compile();

        service = module.get(FeaturesService);
    });

    it('should be defined', () => {
        expect(service).toBeTruthy();
    });
});
