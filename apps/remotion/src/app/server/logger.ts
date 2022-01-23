import * as winston from 'winston';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DatadogWinston = require('datadog-winston');

export function createLogger(service: string, ddtags?: string): winston.Logger {
    const logger: winston.Logger = winston.createLogger({
        level: 'info',
        exitOnError: false,
        format: winston.format.json(),
    });
    if (process.env.NODE_ENV !== 'development') {
        try {

            logger.add(
                new DatadogWinston({
                    apiKey: process.env.DATADOG_API_KEY,
                    hostname: process.env.SERVICE_ENV,
                    service,
                    ddsource: 'nodejs',
                    ddtags
                }),
            );
        } catch (e) {
            console.log("Couldn't load winston");
        }
    }

    logger.add(new winston.transports.Console({
        level: 'info',
        format: winston.format.simple()
    }));

    // logger.transports[0].silent = process.env.NODE_ENV === 'development';

    return logger;
}

export const logger = createLogger('remotion');
