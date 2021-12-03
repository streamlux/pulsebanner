import { Controller, Get, Session, UseGuards } from '@nestjs/common';
import { CustomSession } from '@pulsebanner/auth';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.gaurd';
import { Roles } from './auth/roles.decorator';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getData() {
        return this.appService.getData();
    }

    @Get('/test')
    @UseGuards(AuthGuard)
    async test(@Session() session: CustomSession) {

        console.log(session);

        return session;
    }
}
