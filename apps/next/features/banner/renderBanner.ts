import { Context } from "@app/services/Context";
import { RenderBannerRequest, RenderResponse } from "@app/services/remotion/RemotionClient";
import { getBannerProps } from "@app/services/banner/getBannerProps";
import { RenderProps } from "@pulsebanner/remotion/types";

/**
 * @param context
 * @param twitchUserId
 * @returns base64 of rendered banner
 */
export const renderBanner = async (context: Context, twitchUserId: string): Promise<string> => {

    const renderProps: RenderProps = await getBannerProps(context, { twitchUserId, userId: context.userId });

    const renderBannerRequest: RenderBannerRequest = new RenderBannerRequest(context, renderProps);

    const response: RenderResponse = await renderBannerRequest.send();

    return response.data;
}
