import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';
import { AccountsService } from '@app/services/AccountsService';
import { ProfilePicService } from '@app/services/ProfilePicService';
import { getProfileImageProps } from '@app/services/profileImage/getProfileImageProps';
import { RenderProfilePicRequest, RenderResponse } from '@app/services/remotion/RemotionClient';
import { RenderProps } from '@pulsebanner/remotion/types';

const handler = createAuthApiHandler();

handler.get(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    const userId = (req.query.userId as string) ?? req.session.userId;

    if (userId) {
        const profilePicEntry = await ProfilePicService.getProfilePicEntry(userId);
        const twitterInfo = await AccountsService.getTwitterInfo(userId, true);

        if (profilePicEntry === null || twitterInfo === null) {
            res.status(400).send('Unable to get profilePicEntry or twitterInfo for user on streamup');
        }

        const renderProps: RenderProps = await getProfileImageProps(req.context, { userId, twitterInfo });
        const renderRequest: RenderProfilePicRequest = new RenderProfilePicRequest(req.context, renderProps);
        const response: RenderResponse = await renderRequest.send();

        const img = Buffer.from(response.data, 'base64');

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length,
        });
        res.end(img);
    }
});

export default handler;
