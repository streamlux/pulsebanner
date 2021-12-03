import { Injectable, NotFoundException } from '@nestjs/common';
import { Banner, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {

    constructor(private readonly prisma: PrismaService) { }

    create(data: Prisma.BannerCreateInput): Promise<Banner> {
        return this.prisma.banner.create({
            data,
        });
    }

    upsert(upsertInput: Prisma.BannerUpsertArgs): Promise<Banner> {
        return this.prisma.banner.upsert(upsertInput);
    }

    findAll(params?: Prisma.BannerFindManyArgs): Promise<Banner[]> {
        return this.prisma.banner.findMany(params);
    }

    findOne(findUniqueInput: Prisma.BannerWhereUniqueInput): Promise<Banner> {
        return this.prisma.banner.findUnique({
            where: findUniqueInput,
            rejectOnNotFound: (error: Error) => {
                throw new NotFoundException(error.message);
            }
        });
    }

    update(params: { where: Prisma.BannerWhereUniqueInput, data: Prisma.BannerUpdateInput }): Promise<Banner> {
        return this.prisma.banner.update(params);
    }

    remove(deleteInput: Prisma.BannerWhereUniqueInput): Promise<Banner> {
        return this.prisma.banner.delete({
            where: deleteInput
        });
    }
}
