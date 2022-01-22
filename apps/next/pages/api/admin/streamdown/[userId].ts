import { executeStreamDown } from "@app/features/executeFeatures";
import { Features } from "@app/services/FeaturesService";
import { createAuthApiHandler } from "@app/util/ssr/createApiHandler";

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        console.log(req.session);
        return res.send(401);
    }

    const userId = req.query.userId as string;
    if (userId) {
        console.log('query', req.query);
        await executeStreamDown(userId, (typeof req.query.features === 'string' ? [req.query.features] : req.query.features ?? undefined) as Features[]);
    } else {
        return res.status(400).send('Missing userId');
    }
});

export default handler;
