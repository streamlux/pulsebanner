import { BadRequestException, Controller, InternalServerErrorException, Logger, Param, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { TwitterResponseCode, TwitterService } from '../twitter/twitter.service';
import { remotionHttp } from '../util/axios';

type TemplateRequestBody = {
    foregroundId: string;
    backgroundId: string;
    foregroundProps: Record<string, unknown>;
    backgroundProps: Record<string, unknown>;
};

@Controller('banner')
export class BannerController {
    constructor(
        private prisma: PrismaService,
        private twitterService: TwitterService,
        private twitchService: TwitchService,
        private s3: StorageService
    ) { }

    @Post('streamup/:userId')
    async streamup(@Param('userId') userId: string) {

        const accounts = await this.prisma.getAccountsById(userId);
        const twitchUserId = accounts['twitch'].providerAccountId;
        const twitterAccount = accounts['twitter'];


        // get the banner info saved in Banner table
        const banner = await this.prisma.banner.findFirst({
            where: {
                userId: userId,
            },
        });

        if (banner === null || twitterAccount === null) {
            throw new BadRequestException('Could not find banner entry or Twitter user info.');
        }

        const stream = await this.twitchService.getStream(twitchUserId);
        const twitchUser = await this.twitchService.getUser(twitchUserId);


        const defaultStreamThumbnailUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchUser.login as string}-440x248.jpg`;
        const streamThumbnailUrlTemplate: string = stream?.thumbnail_url ?? defaultStreamThumbnailUrl;
        const streamThumbnailUrl: string = streamThumbnailUrlTemplate.replace('{width}', '440').replace('{height}', '248');

        // call twitter api to get imageUrl and convert to base64
        const bannerUrl: string = await this.twitterService.getBanner(twitterAccount.oauth_token, twitterAccount.oauth_token_secret, twitterAccount.providerAccountId);
        const bucketName = 'pulsebanner';

        // Upload original banner image to s3
        await this.s3.uploadFromUrl(bucketName, userId, bannerUrl);


        // construct template object
        const templateObj: TemplateRequestBody = {
            backgroundId: banner.backgroundId ?? 'CSSBackground',
            foregroundId: banner.foregroundId ?? 'ImLive',
            // pass in thumbnail url
            foregroundProps: { ...(banner.foregroundProps as Prisma.JsonObject), thumbnailUrl: streamThumbnailUrl } ?? {},
            backgroundProps: (banner.backgroundProps as Prisma.JsonObject) ?? {},
        };

        // pass in the bannerEntry info
        const response: AxiosResponse<string> = await firstValueFrom(remotionHttp.post<string>('/getTemplate', templateObj));
        const base64Image: string = response.data;
        // post this base64 image to twitter
        const bannerStatus: TwitterResponseCode = await this.twitterService.updateBanner(twitterAccount.oauth_token, twitterAccount.oauth_token_secret, base64Image);
        if (bannerStatus === 200) {
            return 'Successfully updated Twitter banner.';
        }
        throw new InternalServerErrorException('Failed to set Twitter banner.');
    }

    @Post('streamdown/:userId')
    async streamdown(@Param('userId') userId: string) {
        const accounts = await this.prisma.getAccountsById(userId);
        const twitterAccount = accounts['twitter'];

        // get the banner info saved in Banner table
        const banner = await this.prisma.banner.findFirst({
            where: {
                userId: userId,
            },
        });

        if (banner === null || twitterAccount === null) {
            throw new BadRequestException('Could not find banner entry or Twitter user info.');
        }

        const originalImage: string = await this.s3.download('pulsebanner', userId);
        const response: TwitterResponseCode = await this.twitterService.updateBanner(twitterAccount.oauth_token, twitterAccount.oauth_token_secret, originalImage);
        if (response === 200) {
            Logger.verbose(`Successfully set banner back to original image.`);
            return 'Successfully set banner back to original image.';
        }
        throw new InternalServerErrorException('Failed to set banner back to original image.');
    }
}
