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
    const userId = req.session.userId;
    logger.info('Deleting user', { userId });
    try {

        try {
            // delete all webhooks
            await deleteTwitchSubscriptions(userId);
        } catch (e) {
            logger.error('Error deleting Twitch subscriptions when deleting user', { userId });
        }

        // delete objects from s3
        const s3 = S3Service.createS3();

        try {
            await s3.deleteObject({ Bucket: env.IMAGE_BUCKET_NAME, Key: userId }).promise();
        } catch (e) {
            logger.error('Error deleting from S3 when deleting user', { userId, error: e });
        }

        // delete user from database, which cascade deletes all related entities, including sessions
        const deletedUser = await prisma.user.delete({
            where: {
                id: userId,
            },
        });

        logger.info(`Deleted user ${deletedUser.name}`, { userId, name: deletedUser.name });
        return res.status(200).json({ message: 'Deleted user' });
    } catch (e) {
        logger.error(`Error deleting user`, { userId });
        return res.status(500).json({ message: 'Error deleting user' });
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
