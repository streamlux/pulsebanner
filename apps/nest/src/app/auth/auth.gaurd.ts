import { Injectable, CanActivate, ExecutionContext, Inject, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { SessionService } from './session.service';
import { getSessionFunc } from '@pulsebanner/auth';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

// this gaurd is implemented in the same way
// next-auth implements sessions
// logic taken from: https://github.com/nextauthjs/next-auth/blob/main/src/core/routes/session.ts

const cookieName = 'next-auth.session-token';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private reflector: Reflector, @Inject(SessionService) private sessionService: SessionService, @Inject(PrismaService) private readonly prisma: PrismaService) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();

        const sessionToken = request.cookies[cookieName];
        if (!sessionToken) {
            return false;
        }

        let userAndSession = await this.sessionService.getSessionAndUser(sessionToken);


        // https://github.com/nextauthjs/next-auth/blob/main/src/core/routes/session.ts#L100
        // check if session is expired
        if (userAndSession && userAndSession.session.expires.valueOf() < Date.now()
        ) {
            await this.sessionService.deleteSession(sessionToken)
            userAndSession = undefined
        }

        if (userAndSession) {
            const { user, session } = userAndSession

            // https://next-auth.js.org/configuration/options#session
            const sessionUpdateAge = 24 * 60 * 60; // 24 hours
            const sessionMaxAge = 30 * 24 * 60 * 60; // 30 days


            // Calculate last updated date to throttle write updates to database
            // Formula: ({expiry date} - sessionMaxAge) + sessionUpdateAge
            //     e.g. ({expiry date} - 30 days) + 1 hour
            const sessionIsDueToBeUpdatedDate =
                session.expires.valueOf() -
                sessionMaxAge * 1000 +
                sessionUpdateAge * 1000

            const newExpires = fromDate(sessionMaxAge)
            // Trigger update of session expiry date and write to database, only
            // if the session was last updated more than {sessionUpdateAge} ago
            if (sessionIsDueToBeUpdatedDate <= Date.now()) {
                await this.sessionService.updateSession({ where: { sessionToken }, data: { expires: newExpires } });
            }

            // Pass Session through to the session callback

            const getSession = getSessionFunc(this.prisma);

            // use this function to attach our custom session properties
            const sessionPayload = await getSession({
                // By default, only exposes a limited subset of information to the client
                // as needed for presentation purposes (e.g. "you are logged in as...").
                session: {
                    user: {
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    },
                    expires: session.expires.toISOString(),
                },
                user,
            });


            // Set cookie again to update expiry
            response.cookie(cookieName, sessionToken, {
                maxAge: sessionMaxAge,
                expires: newExpires,
            });

            // Set session payload on the request
            request['session'] = sessionPayload;

            const roles = this.reflector.get<string[]>('roles', context.getHandler());
            if (roles) {
                if (!roles.includes(sessionPayload.role)) {
                    return false;
                }
            }

            return true;

        } else if (sessionToken) {
            // If `sessionToken` was found set but it's not valid for a session then
            // remove the sessionToken cookie from browser.
            response.clearCookie(cookieName);
        }
    } catch(error: unknown) {
        Logger.error("SESSION_ERROR", error as Error);
        return false;
    }
}

/**
 * Takes a number in seconds and returns the date in the future.
 * Optionally takes a second date parameter. In that case
 * the date in the future will be calculated from that date instead of now.
 */
export function fromDate(time: number, date = Date.now()) {
    return new Date(date + time * 1000)
}
