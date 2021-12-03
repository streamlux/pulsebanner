import { Controller, Get, Post, Body, UseGuards, Param, Session, HttpStatus, HttpCode } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomSession } from '@pulsebanner/auth';
import { AuthGuard } from '../auth/auth.gaurd';
import { Roles } from '../auth/roles.decorator';
import { BannersService } from './banners.service';

@UseGuards(AuthGuard)
@Controller('banners')
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    @Post()
    async upsert(@Body() upsertBannerDto: Prisma.BannerArgs) {
        return;
    }

    @Get('list')
    @Roles('admin')
    findAll() {
        return this.bannersService.findAll();
    }

    @Get()
    findUserBanner(@Session() session: CustomSession) {
        return this.bannersService.findOne({
            userId: session.userId
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bannersService.findOne({ id });
    }

    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    //     return this.bannersService.update(+id, updateBannerDto);
    // }

    // @Delete(':id')
    // remove(@Param('id') id: string) {
    //     return this.bannersService.remove(+id);
    // }
}
