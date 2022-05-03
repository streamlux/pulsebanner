import { NextApiRequest, NextApiResponse } from 'next';
import nc, { ErrorHandler } from 'next-connect';
import auth, { AppNextApiRequest } from '../../middlewares/auth';
import admin from '../../middlewares/admin';
import NextCors from 'nextjs-cors';
import { logger } from '../logger';

const onErrorAdminContext: ErrorHandler<AppNextApiRequest, NextApiResponse> = (err, req, res, next) => {
    req.context.logger.error('Error handling admin API request', { error: err, method: req.method, url: req.url, query: req.query, body: req.body });
    res.status(500).end(err.toString());
};

const onErrorContext: ErrorHandler<AppNextApiRequest, NextApiResponse> = (err, req, res, next) => {
    req.context.logger.error('Error handling API request', { error: err, method: req.method, url: req.url, query: req.query, body: req.body });
    res.status(500).end(err.toString());
};

const onError: ErrorHandler<NextApiRequest, NextApiResponse> = (err, req, res, next) => {
    logger.error('Error handling API request', { error: err, method: req.method, url: req.url, query: req.query, body: req.body });
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
export const createApiHandler = <T extends NextApiRequest>(cors?: CorsOptions, err: ErrorHandler<T, NextApiResponse> = onError) => {

    if (cors) {
        return nc<T, NextApiResponse>({
            onError: err,
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
            onError: err,
        })
    }
}

/**
 * Next.js API route handler that requires a session. Adds the session to the request object.
 */
export const createAuthApiHandler = (cors?: CorsOptions) => createApiHandler<AppNextApiRequest>(cors, onErrorContext).use(auth);

/**
 * Next.js API route handler that requires a session. Adds the session to the request object.
 */
export const createAdminApiHandler = (cors?: CorsOptions) => createApiHandler<AppNextApiRequest>(cors, onErrorAdminContext).use(admin);
