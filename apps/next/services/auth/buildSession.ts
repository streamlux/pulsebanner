/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { sendError } from "@app/util/discord/sendError";
import env from "@app/util/env";
import { logger } from "@app/util/logger";
import prisma from "@app/util/ssr/prisma";
import { createTwitterClient } from "@app/util/twitter/twitterHelpers";
import { Account, Role } from "@prisma/client";
import { AccessToken, accessTokenIsExpired, refreshUserToken, StaticAuthProvider } from "@twurple/auth";
import axios from "axios";
import { Session as NextSession, User as NextUser } from "next-auth";
import { CustomSession } from "./CustomSession";

export async function buildSession(session: NextSession, user: NextUser): Promise<CustomSession> {

    const customSession: CustomSession = {
        ...session,
        userId: user.id,
        accounts: {},
        role: user.role as Role,
        user: {
            ...user,
            role: user.role as Role,
        }
    };

    const accounts = await prisma.account.findMany({
        where: {
            userId: user.id,
        },
    });

    accounts.forEach(async (account: Account) => {
        // Boolean specifying if the user has connected this account or not
        customSession.accounts[account.provider] = true;

        if (account.provider === 'twitch' && account.access_token) {
            const authProvider: StaticAuthProvider = new StaticAuthProvider(env.TWITCH_CLIENT_ID, account.access_token, undefined, 'user');
            const token: AccessToken | null = await authProvider.getAccessToken();

            // Check if twitch access token is expired
            if (token && accessTokenIsExpired(token) && token.refreshToken) {
                logger.info(`Twitch user access token is expired for user: '${user.name}'. Refreshing token...`);
                try {
                    const newToken: AccessToken = await refreshUserToken(env.TWITCH_CLIENT_ID, env.TWITCH_CLIENT_SECRET, token.refreshToken);
                    if (newToken && newToken.expiresIn) {
                        // update the access token and other token details in the database
                        await prisma.account.update({
                            where: {
                                id: account.id,
                            },
                            data: {
                                access_token: newToken.accessToken,
                                refresh_token: newToken.refreshToken,
                                expires_at: newToken.obtainmentTimestamp + 1000 * newToken.expiresIn,
                                token_type: account.token_type,
                                scope: newToken.scope.join(' '),
                            },
                        });
                        logger.info(`Twitch user access token is expired for user: '${user.name}'. Refreshing token...`);
                    }

                } catch (e) {
                    const msgs = [`Failed to refresh Twitch user access token for user: '${user.name}'.`];
                    const msg = msgs.join('\n');
                    logger.error(msg, e, { userId: user.id });
                    sendError(e as Error, msg);
                }
            }
        } else if (account.provider === 'twitter') {
            // update the profile picture url we have stored for them if it has baen changed (aka 404)
            try {
                if (user.image) {
                    await axios.get(user.image);
                }
            } catch (e) {
                const client = createTwitterClient(account.oauth_token!, account.oauth_token_secret!);
                const twitterUser = await client.accountsAndUsers.usersShow({
                    user_id: account.providerAccountId
                });
                const avatar_url = twitterUser.profile_image_url_https;
                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        image: avatar_url
                    }
                });
            }
        }
    });

    return customSession;
}

