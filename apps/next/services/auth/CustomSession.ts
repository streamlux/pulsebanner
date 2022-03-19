import { Role } from "@prisma/client";
import { Session, User } from "next-auth";

export interface CustomSession extends Session {
    userId: string;
    role: Role;
    accounts: Record<string, boolean>;
    user: User & {
        role: Role;
    }
}
