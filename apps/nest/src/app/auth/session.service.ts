import { Injectable } from '@nestjs/common';
import { Prisma, Session, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {

    constructor(private readonly prisma: PrismaService) { }

    async getSessionAndUser(sessionToken: string): Promise<{ user: User, session: Session }> {
        const userAndSession = await this.prisma.session.findUnique({
            where: { sessionToken },
            include: { user: true },
        });

        const { user, ...session } = userAndSession;
        return { user, session };
    }

    deleteSession(id: string): Promise<Session> {
        return this.prisma.session.delete({
            where: {
                id
            }
        });
    }

    updateSession({ where, data }: Prisma.SessionUpdateArgs) {
        return this.prisma.session.update({
            where,
            data
        });
    }
}
