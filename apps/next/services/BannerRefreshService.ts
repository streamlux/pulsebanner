import { bannerRefresh } from "@app/features/banner/bannerRefresh";
import type { ProductName } from "@app/types/products";
import type { PrismaClient } from "@prisma/client";
import type { Logger } from "winston";

export class BannerRefreshService {

    constructor(private readonly prisma: PrismaClient, private readonly logger: Logger) { }


    public async refreshBanners(product: ProductName): Promise<void> {

        const liveCustomers = await this.getLiveCustomers(product);

        this.logger.info(`Refreshing ${liveCustomers.length} banners for ${product} users.`, {
            count: liveCustomers.length
        });

        const startMs = Date.now();

        for await (const customer of liveCustomers) {
            try {
                await bannerRefresh(customer.user.id);
            } catch (e) {
                // error refreshing banner
                this.logger.error('Error occured during banner refresh.', {
                    userId: customer.user.id,
                    error: {
                        ...e
                    }
                });
            }
        }

        const endMs = Date.now();
        const duration = endMs - startMs;

        this.logger.info(`Done refreshing ${liveCustomers.length} banners for ${product} users in ${duration}ms.`, {
            count: liveCustomers.length,
            duration: endMs - startMs
        });
    }

    /**
     *
     * @param product Subscription tier (Pro vs Personal)
     * @returns Queries the database and finds users who satisfy the following conditions:
     *  - Currently live
     *  - Active subscription of the specified product
     *  - They have the banner feature enabled
     */
    private async getLiveCustomers(product: ProductName) {
        return await this.prisma.liveStreams.findMany({
            where: {
                user: {
                    subscription: {
                        status: 'active',
                        price: {
                            product: {
                                name: {
                                    equals: product
                                }
                            }
                        }
                    },
                    banner: {
                        enabled: true
                    }
                },
            },
            select: {
                user: {
                    select: {
                        id: true
                    }
                }
            }
        });
    }
}
