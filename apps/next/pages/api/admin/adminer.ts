import env from '@app/util/env';
import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';

const handler = createAuthApiHandler();

handler.get(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    return res.redirect(env.ADMINER_URL);
});

export default handler;
