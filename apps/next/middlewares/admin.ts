import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Middleware } from 'next-connect';
import { CustomSession } from '@app/services/auth/CustomSession';

export interface AppNextApiRequest extends NextApiRequest {
    session: CustomSession;
}

const admin: Middleware<AppNextApiRequest, NextApiResponse> = async (req, res, next) => {
    const session: CustomSession | null = await getSession({ req }) as CustomSession;

    if (!session || !session.user) {
        return res.status(403).end('Forbidden');
    }

    if (session.user.role !== 'admin') {
        return res.status(403).end('Forbidden');
    }

    req.session = session;

    return next();
};

export default admin;
