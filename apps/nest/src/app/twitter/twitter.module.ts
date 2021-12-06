/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TwitterService } from './twitter.service';

@Module({
    imports: [],
    controllers: [],
    providers: [TwitterService],
    exports: [TwitterService]
})
export class TwitterModule { }
