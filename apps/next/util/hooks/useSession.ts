import { CustomSession } from "@app/services/auth/CustomSession";
import { UseSessionOptions, useSession as nextUseSession } from "next-auth/react";

export declare type SessionContextValue<R extends boolean = false> = R extends true ? {
    data: CustomSession;
    status: "authenticated";
} | {
    data: null;
    status: "loading";
} : {
    data: CustomSession;
    status: "authenticated";
} | {
    data: null;
    status: "unauthenticated" | "loading";
};

export function useSession<R extends boolean>(options?: UseSessionOptions<R>): SessionContextValue<R> {
    return nextUseSession(options) as SessionContextValue<R>;
}
