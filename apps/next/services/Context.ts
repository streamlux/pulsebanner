import { logger } from "@app/util/logger";
import { nanoid } from "nanoid";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getSession } from "next-auth/react";
import { Logger } from "winston";
import { CustomSession } from "./auth/CustomSession";

export interface RequestContext {
    /**
    * Automatically attached userId and requestId to logs
    */
    readonly logger: Logger;

    /**
     * Request or action ID.
     */
    readonly id: string;

    /**
     * Additional metadata to log.
     */
    readonly metadata: Record<string, any>;
}

export class Context implements RequestContext {

    /**
    * User ID of the user associated with the request.
    */
    readonly userId: string;
    public readonly logger: Logger;
    public readonly id: string;
    public readonly metadata: Record<string, any> = {};

    constructor(userId: string, metadata?: Record<string, any>) {
        this.id = nanoid(12); // 12 character long random string
        this.userId = userId;
        this.metadata = metadata ?? {};

        // metadata attached to every log
        this.logger = logger.child({
            context: {
                id: this.id,
                userId: this.userId,
                ...this.metadata,
            }
        });
    }
}

export class ActionContext implements RequestContext {

    public readonly name: string;
    public readonly logger: Logger;
    public readonly id: string;
    public readonly metadata: Record<string, any> = {};

    constructor(name: string, metadata?: Record<string, any>) {
        this.id = nanoid(12); // 12 character long random string
        this.name = name;
        this.metadata = metadata ?? {};

        // metadata attached to every log
        this.logger = logger.child({
            context: {
                id: this.id,
                name: this.name,
                ...this.metadata,
            }
        });
    }
}

export class SSRContext implements RequestContext {

    public readonly name: string;
    public readonly logger: Logger;
    public readonly id: string;
    public readonly metadata: Record<string, any> = {};

    constructor(name: string, metadata?: Record<string, any>) {
        this.id = nanoid(12); // 12 character long random string
        this.name = name;
        this.metadata = metadata ?? {};

        // metadata attached to every log
        this.logger = logger.child({
            context: {
                id: this.id,
                name: this.name,
                ...this.metadata,
            }
        });
    }
}

interface Handler<T> {
    hasSession: (context: Context) => Promise<T>;
    noSession: () => T | Promise<T>;
    error: (error: Error) => T | Promise<T>;
}

export async function callWithContext<T>(ctx: GetServerSidePropsContext, handler: Handler<GetServerSidePropsResult<T>>): Promise<GetServerSidePropsResult<T>> {
    try {
        const session: CustomSession | null = (await getSession(ctx)) as CustomSession | null;
        if (session && session.userId) {
            const context = new Context(session.userId);
            return await handler.hasSession(context);
        } else {
            return await handler.noSession();
        }
    } catch (e) {
        logger.error('Error in callWithContext', { error: e, url: ctx.resolvedUrl });
        return handler.error(e as Error);
    }
}
