import { executeStreamUp } from "@app/features/executeFeatures";
import { Context } from "@app/services/Context";
import { Features } from "@app/services/FeaturesService";
import { createAuthApiHandler } from "@app/util/ssr/createApiHandler";

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        return res.send(401);
    }

    const userId = req.query.userId as string;
    if (userId) {
        const context = new Context(userId, {
            action: 'Stream up (admin)',
            admin: true,
        });
        console.log('query', req.query);
        await executeStreamUp(context, (typeof req.query.features === 'string' ? [req.query.features] : req.query.features ?? undefined) as Features[]);
    } else {
        return res.status(400).send('Missing userId');
    }
});

export default handler;
