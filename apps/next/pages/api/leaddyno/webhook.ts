import { logger } from '@app/util/logger';
import { createApiHandler } from '@app/util/ssr/createApiHandler';

const handler = createApiHandler();

handler.post(async (req, res) => {
    const body = req;
    logger.warn('Got the body of the request: ', { info: body });
    res.status(200).send('Succes');
});

export default handler;
