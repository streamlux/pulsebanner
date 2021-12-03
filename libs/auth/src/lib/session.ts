import { PrismaClient, Role, User } from '@prisma/client';
import { JWT } from 'next-auth/jwt';
import { ISODateString, Session, User as NextUser } from 'next-auth';
import { getSecondsSinceEpoch } from '@pulsebanner/util';
import { refreshAccessToken } from '@pulsebanner/twitch';

export interface CustomSession extends Record<string, unknown> {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: Role;
        id: string;
    };
    role: Role;
    userId: string;
    accounts: Record<'twitter' | 'twitch', boolean>;
    expires: ISODateString;
}

export function getSessionFunc(prisma: PrismaClient): (params: { session: Session; user: NextUser; token?: JWT; }) => Promise<CustomSession> {
    const sessionFactory = async ({ session, user }: { session: Session; user: User; token?: JWT; }): Promise<CustomSession> => {

        const customSession: CustomSession = {
            ...session,
            user: {
                ...session.user,
                role: user.role,
                id: user.id
            },
            accounts: {
                twitch: false,
                twitter: false
            },
            role: user.role,
            userId: user.id
        }

        const accounts = await prisma.account.findMany({
            where: {
                userId: user.id,
            },
        });

        accounts.forEach(async (account) => {
            if (account.provider === 'twitch') {
                // Check if twitch access token is expired
                if (account.expires_at <= getSecondsSinceEpoch()) {
                    console.log('Refreshing twitch access token');
                    // Use the refresh token to request a new access token from twitch
                    const data = await refreshAccessToken(account.refresh_token);

                    // update the access token and other token details in the database
                    await prisma.account.update({
                        where: {
                            id: account.id,
                        },
                        data: {
                            access_token: data.access_token,
                            refresh_token: data.refresh_token,
                            expires_at: data.expires_at,
                            token_type: data.token_type,
                            scope: data.scope,
                        },
                    });
                }
            }

            // Boolean specifying if the user has connected this account or not
            customSession.accounts[account.provider] = true;
        });

        return customSession;
    }

    return sessionFactory;

}
