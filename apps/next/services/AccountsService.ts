import prisma from "@app/util/ssr/prisma";
import { Account } from "@prisma/client";
import { CustomSession } from "./auth/CustomSession";
import { PostgresTwitterInfo } from "./postgresHelpers";

export class AccountsService {

    public static async getAccounts(session: CustomSession): Promise<Record<string, Account>> {
        const accounts = await prisma.account.findMany({
            where: {
                userId: session.user['id'],
            },
        });

        const result: Record<string, Account> = {};
        accounts.forEach((account) => {
            result[account.provider] = account;
        });
        return result;
    }

    public static async getAccountsById(userId: string): Promise<Record<string, Account>> {
        const accounts = await prisma.account.findMany({
            where: {
                userId: userId,
            },
        });

        const result: Record<string, Account> = {};
        accounts.forEach((account) => {
            result[account.provider] = account;
        });
        return result;
    }

    public static async getTwitterInfo(userId: string, getProviderAccountId = false): Promise<Required<PostgresTwitterInfo>> {
        const twitterInfo = await prisma.account.findFirst({
            where: {
                userId: userId,
                provider: 'twitter',
            },
            select: {
                oauth_token: true,
                oauth_token_secret: true,
                providerAccountId: getProviderAccountId,
            },
            rejectOnNotFound: true
        });

        return twitterInfo as Required<PostgresTwitterInfo>;
    };
}
