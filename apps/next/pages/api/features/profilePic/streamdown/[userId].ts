import { localAxios } from "@app/util/axios";
import { getProfilePicEntry, getTwitterInfo } from "@app/util/database/postgresHelpers";
import { TwitterResponseCode, updateProfilePic } from "@app/util/twitter/twitterHelpers";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const userId: string = req.query.userId as string;

    if (userId) {
        const profilePicInfo = await getProfilePicEntry(userId);

        const twitterInfo = await getTwitterInfo(userId);

        if (profilePicInfo === null || twitterInfo === null) {
            return res.status(400).send('Could not find profile pic entry or twitter info for user');
        }

        // get the original image from the
        const response = await localAxios.get(`/api/storage/download/${userId}`);
        if (response.status === 200) {
            console.log('Found user in db and got image');
        } else {
            res.status(404).send('Unable to find user in database for profile pic on streamdown');
        }

        const profilePicStatus: TwitterResponseCode = await updateProfilePic(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, response.data);
        return profilePicStatus === 200 ? res.status(200).send('Set profile pic back to original image') : res.status(400).send('Unable to set profile pic to original image');
    }
}
