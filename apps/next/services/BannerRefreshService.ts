import { bannerRefresh } from "@app/features/banner/bannerRefresh";
import type { PrismaClient } from "@prisma/client";
import { Context, RequestContext } from "./Context";

type ProductName = 'Personal' | 'Professional';

export class BannerRefreshService {

    constructor(private readonly prisma: PrismaClient, private readonly context: RequestContext) { }


    public async refreshBanners(product: ProductName): Promise<void> {

        const liveCustomers = await this.getLiveCustomers(product);

        this.context.logger.info(`Refreshing ${liveCustomers.length} banners for ${product} users.`, {
            count: liveCustomers.length
        });

        const startMs = Date.now();

        for await (const customer of liveCustomers) {
            const context = new Context(customer.user.id, { parentId: this.context.id });
            try {
                await bannerRefresh(context);
            } catch (e) {
                // error refreshing banner
                context.logger.error('Error occured during banner refresh.', {
                    error: {
                        error: e
                    }
                });
            }
        }

        const endMs = Date.now();
        const duration = endMs - startMs;

        this.context.logger.info(`Done refreshing ${liveCustomers.length} banners for ${product} users in ${duration}ms.`, {
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
