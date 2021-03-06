import { executeStreamDown } from '@app/features/executeFeatures';
import { Features } from '@app/services/FeaturesService';
import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        logger.info('Admin streamdown for user. Session is not an admin session. Returning.');
        return res.send(401);
    }

    const userId = req.query.userId as string;
    if (userId) {
        logger.info('Admin query for streamdown.', { query: req.query });
        await executeStreamDown(userId, (typeof req.query.features === 'string' ? [req.query.features] : req.query.features ?? undefined) as Features[]);
    } else {
        logger.error('Admin streamdown is missing userId');
        return res.status(400).send('Missing userId');
    }
});

export default handler;
