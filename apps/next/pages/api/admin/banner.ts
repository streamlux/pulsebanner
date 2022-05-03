import { AccountsService } from '@app/services/AccountsService';
import { getBannerEntry } from '@app/services/postgresHelpers';
import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';
import { RenderProps } from '@pulsebanner/remotion/types';
import { getBannerProps } from '@app/services/banner/getBannerProps';
import { RenderBannerRequest, RenderResponse } from '@app/services/remotion/RemotionClient';

const handler = createAuthApiHandler();

handler.get(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    const userId = req.query.userId as string ?? req.session.userId;

    req.context.addMetadata({
        action: 'Render banner (admin)'
    });

    const accounts = await AccountsService.getAccountsById(userId);
    const twitchUserId = accounts['twitch'].providerAccountId;

    const twitterInfo = await AccountsService.getTwitterInfo(userId, true);

    const bannerEntry = await getBannerEntry(userId);
    if (bannerEntry === null || twitterInfo === null) {
        return res.status(400).send('Could not find banner entry or twitter info for user');
    }
    const renderProps: RenderProps = await getBannerProps(req.context, { twitchUserId, userId });

    const renderBannerRequest: RenderBannerRequest = new RenderBannerRequest(req.context, renderProps);

    const response: RenderResponse = await renderBannerRequest.send();

    const img = Buffer.from(response.data, 'base64');

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
    });
    res.end(img);
});

export default handler;
