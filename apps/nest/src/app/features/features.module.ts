import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FeaturesService } from './features.service';

@Module({
    providers: [FeaturesService],
    exports: [FeaturesService],
    imports: [HttpModule, PrismaModule]
})
export class FeaturesModule { }
