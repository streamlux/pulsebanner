import { AccountsService } from '@app/services/AccountsService';
import { getBannerEntry } from '@app/services/postgresHelpers';
import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';
import { renderBanner } from '@app/features/banner/renderBanner';

const handler = createAuthApiHandler();

handler.get(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    const userId = req.query.userId as string ?? req.session.userId;

    const accounts = await AccountsService.getAccountsById(userId);
    const twitchUserId = accounts['twitch'].providerAccountId;

    const twitterInfo = await AccountsService.getTwitterInfo(userId, true);

    const bannerEntry = await getBannerEntry(userId);
    if (bannerEntry === null || twitterInfo === null) {
        return res.status(400).send('Could not find banner entry or twitter info for user');
    }

    const banner = await renderBanner(userId, twitchUserId);
    const img = Buffer.from(banner, 'base64');

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
    });

    res.end(img);
});

export default handler;
