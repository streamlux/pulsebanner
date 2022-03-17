import { Role } from '@prisma/client';
import { Session as NextSession } from 'next-auth';
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
    const content: any;
    export const ReactComponent: any;
    export default content;
}

export interface Session extends NextSession {
    userId: string;
    role: Role;
}

export {}
