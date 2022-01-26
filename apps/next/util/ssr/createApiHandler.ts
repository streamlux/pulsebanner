import { NextApiRequest, NextApiResponse } from 'next';
import nc, { ErrorHandler } from 'next-connect';
import auth, { AppNextApiRequest } from '../../middlewares/auth';
import admin from '../../middlewares/admin';
import NextCors from 'nextjs-cors';
import { logger } from '../logger';

export const onError: ErrorHandler<NextApiRequest, NextApiResponse> = (err, req, res, next) => {
    logger.error('Error handling API requet', err);
    res.status(500).end(err.toString());
};

interface CorsOptions {
    route: string,
    origin?: string,
    methods?: string[]
}


/**
 * Next.js API route handler that handles errors. When an error is thrown it responds with a status 500 and includes the error message.
 */
export const createApiHandler = <T extends NextApiRequest>(cors?: CorsOptions) => {

    if (cors) {
        return nc<T, NextApiResponse>({
            onError,
        }).use(cors.route, async (req, res, next) => {
            await NextCors(req, res, {
                // Options
                // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
                ...cors.methods ? { methods: cors.methods } : {},
                origin: cors.origin ?? true,
                optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
            });
            return next();
        });
    } else {
        return nc<T, NextApiResponse>({
            onError,
        })
    }
}

/**
 * Next.js API route handler that requires a session. Adds the session to the request object.
 */
export const createAuthApiHandler = (cors?: CorsOptions) => createApiHandler<AppNextApiRequest>(cors).use(auth);

/**
 * Next.js API route handler that requires a session. Adds the session to the request object.
 */
export const createAdminApiHandler = (cors?: CorsOptions) => createApiHandler(cors).use(admin);
