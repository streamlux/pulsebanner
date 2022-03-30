import { logger } from "@app/util/logger";
import { nanoid } from "nanoid";
import { Logger } from "winston";

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
