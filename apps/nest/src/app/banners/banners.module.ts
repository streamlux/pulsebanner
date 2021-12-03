import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from '../auth/session.service';

@Module({
    imports: [],
    controllers: [BannersController],
    providers: [BannersService, PrismaService, SessionService],
})
export class BannersModule { }
