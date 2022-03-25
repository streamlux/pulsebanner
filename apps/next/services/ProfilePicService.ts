import prisma from "@app/util/ssr/prisma";
import { ProfileImage, RenderedProfileImage } from "@prisma/client";

export class ProfilePicService {

    public static async getProfilePicEntry(userId: string): Promise<ProfileImage | null> {
        const profilePic = await prisma.profileImage.findFirst({
            where: {
                userId: userId,
            },
        });

        return profilePic;
    };

    /**
     *
     * @param userId
     * @returns null if it doesn't exist
     */
    public static async getProfilePicRendered(userId: string): Promise<RenderedProfileImage | null> {
        const profilePicRendered = await prisma.renderedProfileImage.findFirst({
            where: {
                userId: userId,
            },
        });

        return profilePicRendered;
    };

    public static async updateProfilePicRenderedDB(userId: string): Promise<void> {
        await prisma.renderedProfileImage.upsert({
            where: {
                userId: userId,
            },
            create: {
                userId: userId,
                lastRendered: new Date(),
            },
            update: {
                lastRendered: new Date(),
            },
        });
    };
}
