import { AppNextApiRequest } from '@app/middlewares/admin';
import { localAxios } from '@app/util/axios';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import { NextApiResponse } from 'next';

const handler = createAuthApiHandler();

handler.delete(async (req: AppNextApiRequest, res: NextApiResponse): Promise<void> => {
    const userId = req.session.userId;

    // delete all webhooks
    await localAxios.delete('/api/twitch/subscription');

    // delete images in s3
    await localAxios.post(`/api/storage/delete/${userId}`);

    // delete user from database
    await prisma.user.deleteMany({
        where: {
            id: userId,
        },
    });

    return res.status(200).send('Deleted user.');
});

export default handler;
