import { CustomSession } from '@app/services/auth/CustomSession';
import { Account } from '@prisma/client';
import prisma from './ssr/prisma';

export async function getAccounts(session: CustomSession): Promise<Record<string, Account>> {
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
