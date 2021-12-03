import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionService } from './auth/session.service';
import { BannersModule } from './banners/banners.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
    imports: [BannersModule],
    controllers: [AppController],
    providers: [SessionService, PrismaService, AppService],
})
export class AppModule { }
