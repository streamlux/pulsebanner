import { AppNextApiRequest } from '@app/middlewares/admin';
import { FeaturesService } from '@app/services/FeaturesService';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import { NextApiResponse } from 'next';

const handler = createAuthApiHandler();

handler.post(async (req: AppNextApiRequest, res: NextApiResponse): Promise<void> => {
    const userId = req.session.userId;

    const features = await FeaturesService.listEnabled(userId);
    if (features.length !== 0) {
        return res.status(400).send('User has features enabled');
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            accounts: {
                select: {
                    id: true,
                },
                where: {
                    provider: 'twitch'
                }
            }
        },
    });

    const twitchAccountId = user?.accounts[0]?.id;

    if (!twitchAccountId) {
        return res.status(409).send('Account to delete not found.');
    }

    // delete Twitch account from database
    await prisma.account.delete({
        where: {
            id: twitchAccountId,
        }
    });

    return res.status(200).send('Deleted Twitch account.');
});

export default handler;
