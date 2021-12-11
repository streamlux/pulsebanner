import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';

const handler = createAuthApiHandler();

handler.get(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    const envKey = 'ANALYTICS_URL';
    const url = process.env[envKey];
    if (!url) {
        res.send({ error: { message: `Missing ${envKey} environment variable.` } });
    }

    return res.redirect(url);
});

export default handler;
