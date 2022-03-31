import { BannerRefreshService } from '@app/services/BannerRefreshService';
import { ActionContext } from '@app/services/Context';
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { logger } from '../logger';
import prisma from './prisma';

export class StartupService {

    private static hasLoaded = false;

    // Function is called when prisma is loaded, which hopefully will be almost right at startup
    public static onLoad(): void {
        logger.info('onLoad called');
        if (this.hasLoaded === true || process.env.NODE_ENV === 'development') {
            logger.info('onLoad no-op');
            return;
        }
        logger.info('onLoad running');
        try {
            this.hasLoaded = true;
            const scheduler = new ToadScheduler();

            const refreshProfessional = new AsyncTask(
                'refresh professional',
                async () => {
                    const context = new ActionContext('Refresh professional banners');
                    const refreshService = new BannerRefreshService(prisma, context);
                    await refreshService.refreshBanners('Professional');
                },
                (err: Error) => {
                    /* handle error here */
                    logger.error('Error occured executing scheduled job.', { ...err });
                }
            );

            const refreshPersonal = new AsyncTask('refresh personal',
                async () => {
                    const context = new ActionContext('Refresh personal banners');
                    const refreshService = new BannerRefreshService(prisma, context);
                    await refreshService.refreshBanners('Personal');
                },
                (err: Error) => {
                    /* handle error here */
                    logger.error('Error occured executing scheduled job.', { ...err });
                }
            );

            scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: 10, }, refreshProfessional));
            scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ hours: 1, }, refreshPersonal));

            logger.info('Loaded');

        } catch (e) {
            // failed to load
            logger.error('Error occured within onLoad function.',
                { error: e }
            );
        }
    }
}
