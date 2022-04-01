import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Middleware } from 'next-connect';
import { Context } from '@app/services/Context';
import { CustomSession } from '@app/services/auth/CustomSession';

interface AuthReq {
    session: CustomSession;
    context: Context;
}

export type AppNextApiRequest = AuthReq & NextApiRequest;

const auth: Middleware<AppNextApiRequest, NextApiResponse> = async (req, res, next) => {
    const session = await getSession({ req });

    if (!session) {
        return res.status(403).end('Forbidden');
    }

    if (!session.userId || typeof session.userId !== 'string') {
        return res.status(403).end('Missing userId in session');
    }

    if (!session.role) {
        return res.status(403).end('Missing role in session');
    }

    const authReq: AuthReq = {
        session: session as AppNextApiRequest['session'],
        context: new Context(session.userId)
    }

    req.session = authReq.session;
    req.context = authReq.context;

    return next();
};

export default auth;
