import type { Banner, Tweet } from '@prisma/client';
import { createApiHandler } from '@app/util/ssr/createApiHandler';
import { FeaturesService } from '@app/services/FeaturesService';

// Just append new types here for ease since this will be the 'preprocessor' of all twitch features
export type FeatureMapTypes = {
    featureMap: {
        tweet?: Tweet;
        banner?: Banner;
    };
};

// const handler = createApiHandler({ route: '/api/features/:userId' });
const handler = createApiHandler();

handler.get(async (req, res) => {
    const userId: string = req.query.userId as string;
    const enabled = await FeaturesService.listEnabled(userId);
    return res.status(200).json({ enabled });
});

export default handler;
