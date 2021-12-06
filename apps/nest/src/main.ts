/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

// addons
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { raw } from 'body-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';
    // https://docs.nestjs.com/faq/global-prefix
    app.setGlobalPrefix(globalPrefix);

    app.use('/twitch/notification/*', raw({
        verify: (req, res, buf) => {
            // Small modification to the JSON bodyParser to expose the raw body in the request object
            // The raw body is required at signature verification
            req['rawBody'] = buf;
        }
    }));

    // https://docs.nestjs.com/techniques/cookies
    app.use(cookieParser());

    // https://docs.nestjs.com/security/csrf
    // app.use('', csurf({
    //     cookie: {
    //         // configure NestJS to validate CSRF token that we create in the NextJS api via next-auth
    //         // this is just specifying what cookie contains the CSRF token
    //         key: 'next-auth.csrf-token'
    //     }
    // }));

    const port = process.env.PORT || 3333;
    await app.listen(port, () => {
        Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
    });
}

bootstrap();
