import { BannerRefreshService } from '@app/services/BannerRefreshService';
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { logger } from '../logger';
import prisma from './prisma';

let hasLoaded = false;

// Function is called when prisma is loaded, which hopefully will be almost right at startup
export function onLoad(): void {
    if (hasLoaded === true) {
        return;
    }

    try {
        hasLoaded = true;
        const scheduler = new ToadScheduler();

        const task = new AsyncTask(
            'simple task',
            async () => {
                const refreshService = new BannerRefreshService(prisma, logger);
                await refreshService.refreshBanners('Professional');
            },
            (err: Error) => {
                /* handle error here */
                logger.error('Error occured executing scheduled job.', { ...err });
            }
        );

        const job = new SimpleIntervalJob({ minutes: 1, }, task)

        scheduler.addSimpleIntervalJob(job);

        logger.info('Loaded');

    } catch (e) {
        // failed to load
        logger.error('Error occured within onLoad function.',
            { ...e }
        );
    }
}
