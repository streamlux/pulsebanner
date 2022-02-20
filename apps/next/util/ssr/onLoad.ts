import { BannerRefreshService } from '@app/services/BannerRefreshService';
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { logger } from '../logger';
import prisma from './prisma';

let hasLoaded = false;

// Function is called when prisma is loaded, which hopefully will be almost right at startup
export function onLoad(): void {
    if (hasLoaded === true || process.env.NODE_ENV === 'development') {
        return;
    }

    try {
        hasLoaded = true;
        const scheduler = new ToadScheduler();

        const refreshProfessional = new AsyncTask(
            'refresh professional',
            async () => {
                const refreshService = new BannerRefreshService(prisma, logger);
                await refreshService.refreshBanners('Professional');
            },
            (err: Error) => {
                /* handle error here */
                logger.error('Error occured executing scheduled job.', { ...err });
            }
        );

        const refreshPersonal = new AsyncTask('refresh personal',
            async () => {
                const refreshService = new BannerRefreshService(prisma, logger);
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
            { ...e }
        );
    }
}
