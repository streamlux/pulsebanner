import NextAuth, { User } from 'next-auth';
import TwitchProvider from 'next-auth/providers/twitch';
import TwitterProvider from 'next-auth/providers/twitter';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@app/util/ssr/prisma';
import { nanoid } from 'nanoid';
import { getBanner } from '@app/util/twitter/twitterHelpers';
import { AccessToken, accessTokenIsExpired, refreshUserToken, StaticAuthProvider } from '@twurple/auth';
import { sendMessage } from '@app/util/discord/sendMessage';
import { sendError } from '@app/util/discord/sendError';
import { env } from 'process';
import { uploadBase64 } from '@app/util/s3/upload';
import imageToBase64 from 'image-to-base64';
import { getAccountInfo } from '@app/util/database/postgresHelpers';
import { localAxios } from '@app/util/axios';
import { logger } from '@app/util/logger';

// File contains options and hooks for next-auth, the authentication package
// we are using to handle signup, signin, etc.
// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

export default NextAuth({
    adapter: PrismaAdapter(prisma),
    // https://next-auth.js.org/configuration/providers
    providers: [
        TwitchProvider({
            clientId: process.env.TWITCH_CLIENT_ID,
            clientSecret: process.env.TWITCH_CLIENT_SECRET,
        }),
        TwitterProvider({
            clientId: process.env.TWITTER_ID,
            clientSecret: process.env.TWITTER_SECRET,
            // See here for the type of TwitterProfile:
            // https://github.com/nextauthjs/next-auth/blob/main/src/providers/twitter.ts
            profile: (profile: any) => {
                if (profile.email === '' || profile.email === undefined || profile.email === null) {
                    // Twitter does not require email to make account, since you can sign up with phone number
                    // so we have to fill it in with a uuid, to protect against someone signing up with someone elses
                    // email and then taking over their account
                    profile.email = nanoid();
                }
                const user: User & { id: string } = {
                    id: profile.id_str,
                    name: profile.name,
                    email: profile.email,
                    image: profile.profile_image_url_https.replace(/_normal\.(jpg|png|gif)$/, '.$1'),
                };

                return user;
            },
        }),
    ],
    // Database optional. MySQL, Maria DB, Postgres and MongoDB are supported.
    // https://next-auth.js.org/configuration/databases
    //
    // Notes:
    // * You must install an appropriate node_module for your database
    // * The Email provider requires a database (OAuth providers do not)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    database: process.env.DATABASE_URL,

    // The secret should be set to a reasonably long random string.
    // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
    // a separate secret is defined explicitly for encrypting the JWT.
    secret: process.env.SECRET,

    session: {
        // Use JSON Web Tokens for session instead of database sessions.
        // This option can be used with or without a database for users/accounts.
        // Note: `jwt` is automatically set to `true` if no database is specified.
        jwt: false,

        // Seconds - How long until an idle session expires and is no longer valid.
        // maxAge: 30 * 24 * 60 * 60, // 30 days

        // Seconds - Throttle how frequently to write to database to extend a session.
        // Use it to limit write operations. Set to 0 to always update the database.
        // Note: This option is ignored if using JSON Web Tokens
        // updateAge: 24 * 60 * 60, // 24 hours
    },

    // JSON Web tokens are only used for sessions if the `jwt: true` session
    // option is set - or by default if no database is specified.
    // https://next-auth.js.org/configuration/options#jwt
    jwt: {
        // A secret to use for key generation (you should set this explicitly)
        // secret: 'INp8IvdIyeMcoGAgFGoA61DdBglwwSqnXJZkgz8PSnw',
        secret: process.env.SECRET,
        // Set to true to use encryption (default: false)
        // encryption: true,
        // You can define your own encode/decode functions for signing and encryption
        // if you want to override the default behaviour.
        // encode: async ({ secret, token, maxAge }) => {},
        // decode: async ({ secret, token, maxAge }) => {},
    },

    // You can define custom pages to override the built-in ones. These will be regular Next.js pages
    // so ensure that they are placed outside of the '/api' folder, e.g. signIn: '/auth/mycustom-signin'
    // The routes shown here are the default URLs that will be used when a custom
    // pages is not specified for that route.
    // https://next-auth.js.org/configuration/pages
    pages: {
        signIn: '/auth/signin', // Displays signin buttons
        // signOut: '/auth/signout', // Displays form with sign out button
        // error: '/auth/error', // Error code passed in query string as ?error=
        // verifyRequest: '/auth/verify-request', // Used for check email page
        // newUser: null // If set, new users will be directed here on first sign in
    },

    // Callbacks are asynchronous functions you can use to control what happens
    // when an action is performed.
    // https://next-auth.js.org/configuration/callbacks
    callbacks: {
        // async signIn({ user, account, profile, email, credentials }) { return true },
        // async redirect({ url, baseUrl }) { return baseUrl },
        redirect({ url, baseUrl }) {
            if (url.startsWith(baseUrl)) return url;
            // Allows relative callback URLs
            else if (url.startsWith('/')) return new URL(url, baseUrl).toString();
            return baseUrl;
        },
        // async session({ session, token, user }) { return session },
        // async jwt({ token, user, account, profile, isNewUser }) { return token },
        // Use this session callback to add custom information to the session. Ex: role
        async session({ session, token, user }) {
            const accounts = await prisma.account.findMany({
                where: {
                    userId: user.id,
                },
            });

            session.user['role'] = user.role;
            session.userId = user.id;
            session.user['id'] = user.id;
            session.role = user.role;
            session.accounts = {};
            accounts.forEach(async (account) => {
                // Boolean specifying if the user has connected this account or not
                session.accounts[account.provider] = true;

                if (account.provider === 'twitch') {
                    const authProvider: StaticAuthProvider = new StaticAuthProvider(process.env.TWITCH_CLIENT_ID, account.access_token, undefined, 'user');
                    const token: AccessToken = await authProvider.getAccessToken();

                    // Check if twitch access token is expired
                    if (accessTokenIsExpired(token)) {
                        logger.info(`Twitch user access token is expired for user: '${user.name}'. Refreshing token...`);
                        try {
                            const newToken: AccessToken = await refreshUserToken(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET, token.refreshToken);
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
                        } catch (e) {
                            const msgs = [`Failed to refresh Twitch user access token for user: '${user.name}'.`];
                            const msg = msgs.join('\n');
                            logger.error(msg, e);
                            sendError(e, msg);
                        }
                    }
                }
            });
            return session;
        },
    },

    // Events are useful for logging
    // https://next-auth.js.org/configuration/events
    events: {
        createUser: (message: { user: User }) => {
            prisma.user.count().then((value) => {
                sendMessage(`"${message.user.name}" signed up for PulseBanner! Total users: ${value}`, process.env.DISCORD_WEBHOOK_URL);
            });
        },
        signIn: (message: { user: User; account: any; isNewUser: boolean }) => {
            // we automatically upload the user's banner to s3 storage on first sign in
            if (message.isNewUser === true && message.account.provider === 'twitter') {
                const twitterProvider = message.account;
                getBanner(message.user.id, twitterProvider.oauth_token, twitterProvider.oauth_token_secret, twitterProvider.providerAccountId).then((bannerUrl) => {
                    if (bannerUrl === 'empty') {
                        uploadBase64(env.BANNER_BACKUP_BUCKET, message.user.id, 'empty')
                            .then(() => {
                                logger.info('Uploaded empty banner on new user signup.');
                            })
                            .catch((reason) => {
                                logger.error('Error uploading empty banner to backup bucket on new user signup', reason);
                                sendError(reason, 'Error uploading empty banner to backup bucket on new user signup');
                            });
                    } else {
                        imageToBase64(bannerUrl).then((base64: string) => {
                            uploadBase64(env.BANNER_BACKUP_BUCKET, message.user.id, base64)
                                .then(() => {
                                    logger.info('Uploaded Twitter banner on new user signup.')
                                })
                                .catch((reason) => {
                                    logger.error('Error uploading Twitter banner to backup bucket on new user signup', reason);
                                    sendError(reason, 'Error uploading Twitter banner to backup bucket on new user signup');
                                });
                        });
                    }
                });
                // subscribe user email to the newsletter
                if (message.user.email && message.user.email.indexOf('@') > -1) {
                    localAxios
                        .post('/api/newsletter/subscribe', { email: message.user.email })
                        .then((resp) => {
                            logger.info(`Added user email ${message.user.email} to newsletter`);
                        })
                        .catch((reason) => {
                            logger.error('Not able to sign user up for newsletter: ', reason);
                        });
                }
                // we need to update the account info if twitter oauth isn't matching
            } else if (message.isNewUser === false && message.account.provider === 'twitter') {
                getAccountInfo(message.user.id)
                    .then((response) => {
                        // if we are able to find it, we need to check if the oauth matches and update the account table if it doesn't
                        if (response && (response?.oauth_token !== message.account.oauth_token || response?.oauth_token_secret !== message.account.oauth_token_secret)) {
                            // hack...they should not have 2 twitter accounts under one userid
                            prisma.account
                                .updateMany({
                                    where: {
                                        userId: message.user.id,
                                        provider: 'twitter',
                                    },
                                    data: {
                                        oauth_token: message.account.oauth_token,
                                        oauth_token_secret: message.account.oauth_token_secret,
                                    },
                                })
                                .then((response) => {
                                    logger.info('Successfully updated oauth info for application');
                                })
                                .catch((err) => {
                                    logger.error('error updating oauth info for account', err);
                                });
                        }
                    })
                    .catch((err) => {
                        logger.error('Error getting account info when updating Twitter auth', err);
                    });
            }
        },
    },

    // You can set the theme to 'light', 'dark' or use 'auto' to default to the
    // whatever prefers-color-scheme is set to in the browser. Default is 'auto'
    theme: 'auto',

    // Enable debug messages in the console if you are having problems
    debug: false,
});
