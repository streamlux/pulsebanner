import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// This file was copied from the official NestJS + Prisma guide
// https://docs.nestjs.com/recipes/prisma

@Injectable()
export class PrismaService extends PrismaClient
    implements OnModuleInit {

    async onModuleInit() {
        await this.$connect();
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }
}
