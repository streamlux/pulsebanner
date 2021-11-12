import { Account } from '.prisma/client';
import prisma from './ssr/prisma';

export async function getAccountsById(userId: string): Promise<Record<string, Account>> {
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
