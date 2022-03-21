import { AppNextApiRequest } from '@app/middlewares/admin';
import { AccountsService } from '@app/services/AccountsService';
import { S3Service } from '@app/services/S3Service';
import { TwitchSubscriptionService } from '@app/services/twitch/TwitchSubscriptionService';
import env from '@app/util/env';
import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import { Account } from '@prisma/client';
import { NextApiResponse } from 'next';

const handler = createAuthApiHandler();

handler.delete(async (req: AppNextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const userId = req.session.userId;

        // delete all webhooks
        await deleteTwitchSubscriptions(userId);

        // delete objects from s3
        const s3 = S3Service.createS3();

        try {
            const response = await s3.deleteObject({ Bucket: env.IMAGE_BUCKET_NAME, Key: userId }).promise();
            const statusCode = response.$response.httpResponse.statusCode;
            return res.status(statusCode).send('S3 deletion completed');
        } catch (e) {
            logger.error('Error deleting from S3', e);
        }

        // delete user from database
        await prisma.user.deleteMany({
            where: {
                id: userId,
            },
        });

        return res.status(200).send('Deleted user.');
    } catch (e) {
        return res.status(500).send('Error deleting user.');
    }
});

/**
 * Deletes all Twitch EventSub webhooks for a user
 */
async function deleteTwitchSubscriptions(userId: string) {
    const accounts = await AccountsService.getAccountsById(userId);
    const twitchAccount: Account = accounts['twitch'];
    if (!twitchAccount) {
        return;
    }

    const subscriptionService = new TwitchSubscriptionService();
    const subscriptions = await subscriptionService.getSubscriptions(twitchAccount.providerAccountId);
    await subscriptionService.deleteMany(subscriptions);
}

export default handler;
