import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';

const handler = createAuthApiHandler();

handler.get(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    if (!process.env.ADMINER_URL) {
        res.send({ error: { message: "Missing ADMINER_URL environment variable." } });
    }

    return res.redirect(process.env.ADMINER_URL);
});

export default handler;
