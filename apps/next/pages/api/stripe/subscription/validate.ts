import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';

const handler = createAuthApiHandler();

/**
 * We use this endpoint to check if they are actively subscribed. Say the user stops subscribing, we disable the feature.
 * This endpoint returns the status of the their subscription
 * Response values
 *
 **/
handler.post(async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
        return res.status(404);
    }
});

export default handler;
