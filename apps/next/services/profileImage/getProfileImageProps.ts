import { Prisma } from "@prisma/client";
import { RenderProps } from "@pulsebanner/remotion/types";
import { Context } from "../Context";
import { PostgresTwitterInfo } from "../postgresHelpers";
import { ProfilePicService } from "../ProfilePicService";
import { getTwitterProfilePic } from "../twitter/twitterHelpers";

interface GetBannerPropsData {
    userId: string;
    twitterInfo: PostgresTwitterInfo;
}

/**
 * @param context
 * @param data
 * @returns props for rendering the banner with Remotion {@link RenderProps}
 */
export async function getProfileImageProps(context: Context, data: GetBannerPropsData): Promise<RenderProps> {
    const { userId, twitterInfo } = data;


    const profilePicEntry = await ProfilePicService.getProfilePicEntry(userId);

    if (!profilePicEntry) {
        const err = 'Unable to get profile image props: profilePicEntry not found';
        context.logger.error(err, { userId });
        throw new Error(err);
    }

    // get the existing profile pic
    const profilePicUrl: string = await getTwitterProfilePic(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

    return {
        backgroundId: profilePicEntry.backgroundId ?? 'CSSBackground',
        foregroundId: profilePicEntry.foregroundId ?? 'ProfilePic',
        foregroundProps: { ...(profilePicEntry.foregroundProps as Prisma.JsonObject), imageUrl: profilePicUrl } ?? {},
        backgroundProps: (profilePicEntry.backgroundProps as Prisma.JsonObject) ?? {},
    };
}
