import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Middleware } from 'next-connect';
import { CustomSession } from '@app/services/auth/CustomSession';
import { Context } from '@app/services/Context';

interface AuthReq {
    session: CustomSession;
    context: Context;
}

export type AppNextApiRequest = AuthReq & NextApiRequest;


const admin: Middleware<AppNextApiRequest, NextApiResponse> = async (req, res, next) => {
    const session: CustomSession | null = await getSession({ req }) as CustomSession;

    if (!session || !session.user) {
        return res.status(403).end('Forbidden');
    }

    if (session.user.role !== 'admin') {
        return res.status(403).end('Forbidden');
    }

    const authReq: AuthReq = {
        session: session as AppNextApiRequest['session'],
        context: new Context(session.userId, {
            admin: true
        })
    }

    req.session = authReq.session;
    req.context = authReq.context;

    return next();
};

export default admin;
