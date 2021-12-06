import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TwitterClient, UsersProfileBanner } from 'twitter-api-client';

export type TwitterResponseCode = 200 | 400;

@Injectable()
export class TwitterService {

    constructor(private config: ConfigService) { }

    getClient(oauth_token: string, oauth_token_secret: string): TwitterClient {
        return new TwitterClient({
            apiKey: this.config.get('TWITTER_ID'),
            apiSecret: this.config.get('TWITTER_SECRET'),
            accessToken: oauth_token,
            accessTokenSecret: oauth_token_secret,
        });
    }

    async getBanner(oauth_token: string, oauth_token_secret: string, providerAccountId: string): Promise<string> {
        const client: TwitterClient = this.getClient(oauth_token, oauth_token_secret);
        let imageUrl: string = undefined;
        try {
            const response: UsersProfileBanner = await client.accountsAndUsers.usersProfileBanner({
                user_id: providerAccountId,
            });
            imageUrl = response.sizes['1500x500'].url;
            Logger.verbose(`Retrieved Twitter banner. imageUrl: ${imageUrl}`);
        } catch (e) {
            Logger.verbose(e, `User does not have a banner setup. Will save empty for later`);
            imageUrl = 'empty';
        }

        return imageUrl;
    }

    // pass it the banner so we can just upload the base64 or image url directly
    async updateBanner(oauth_token: string, oauth_token_secret: string, bannerBase64: string): Promise<TwitterResponseCode> {
        const client: TwitterClient = this.getClient(oauth_token, oauth_token_secret);

        // We store empty string if user did not have an existing banner
        if (bannerBase64 === 'empty') {
            try {
                await client.accountsAndUsers.accountRemoveProfileBanner();
            } catch (e) {
                console.log('error: ', e);
                return 400;
            }
        } else {
            try {
                await client.accountsAndUsers.accountUpdateProfileBanner({
                    banner: bannerBase64,
                });
            } catch (e) {
                if ('errors' in e) {
                    // Twitter API error
                    if (e.errors[0].code === 88)
                        // rate limit exceeded
                        console.log('Rate limit will reset on', new Date(e._headers.get('x-rate-limit-reset') * 1000));
                    // some other kind of error, e.g. read-only API trying to POST
                    else console.log('Other error');
                } else {
                    // non-API error, e.g. network problem or invalid JSON in response
                    console.log('Non api error');
                }
                console.log('failed to update banner');
                return 400;
            }
        }
        console.log('success updating banner');
        return 200;
    }
}
