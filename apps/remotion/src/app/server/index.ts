import { bundle } from '@remotion/bundler';
import { getCompositions, renderStill } from '@remotion/renderer';
import { openBrowser } from '@remotion/renderer/dist/open-browser';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { handler } from './handler';
import { helpText } from './help-text';
import { getMimeType } from './image-types';
import { getImageHash } from './make-hash';
import { Browser } from 'puppeteer-core';
import { logger } from './logger';
import { TCompMetadata } from 'remotion';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const queue = require('express-queue');
const queueMw = queue({ activeLimit: 1, queuedLimit: -1 });

let browser: Browser | undefined;
const getBrowser = async (): Promise<Browser> => {

    const openRemotionBrowser = async () => await openBrowser('chrome');

    // open browser if it's not already open
    browser ||= await openRemotionBrowser();

    if (browser?.isConnected()) {
        // return browser if it's connected
        return browser;
    } else {
        // try to open a new browser if it's not connected
        logger.warn('Browser is disconnected, attempting to open new');
        browser = await openRemotionBrowser();
        logger.info('Opened new browser successfully');
        return browser;
    }
};

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;
const bundlePath = path.join(__dirname, '../templates/index.tsx');
const templatePath = path.resolve(__dirname, process.env.NODE_ENV !== 'development' ? '../components/index' : '../../../../../libs/remotion/components/src/index');

let webpackBundling = bundle(bundlePath, undefined, {
    webpackOverride: (current) => {
        return {
            ...current,
            resolve: {
                ...current.resolve,
                alias: {
                    ...current.resolve?.alias,
                    '@pulsebanner/remotion/components': templatePath,
                },
            },
        };
    },
});

app.use(express.json());

const tmpDir = fs.promises.mkdtemp(path.join(os.tmpdir(), 'remotion-'));

webpackBundling.then(() => {
    logger.info('Done bundling.');
});

let comps: TCompMetadata[] | undefined;
const getComp = async (compName: string, inputProps: unknown) => {
    comps ||= await getCompositions(await webpackBundling, {
        inputProps: inputProps as null,
    });

    const comp = comps.find((c) => c.id === compName);
    if (!comp) {
        throw new Error(`No composition called ${compName}. There are ${comps.length} comps.`);
    }

    return comp;
};

// This setting will reveal the real IP address of the user, so we can apply rate limiting.
app.set('trust proxy', 1);

// Not more than 20 requests per minute per user
app.use(
    rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 20,
        // rate limit based on userId, fallback to IP address
        keyGenerator: (req) => req.body.userId ?? req.ip,
        onLimitReached: () => {
            logger.warn('Rate limit reached');
        },
    })
);

/**
 * Format for what we are going to pass in
 * Req Body
 * TemplateId, Thumbnail URL, Twitch info
 */
// api call (POST) to here sending the required information
app.post(
    '/getTemplate',
    queueMw,
    handler(async (req, res) => {


        const startMs = Date.now();
        const requestBody = req.body;
        logger.info('Rendering banner', requestBody);
        const queueLength = queueMw.queue.getLength();
        if (queueLength > 0) {
            logger.info(`Request queue length: ${queueLength}`);
        }

        // hard coded info as we only use one composition composer and generate different templates from there by passing the different props
        const imageFormat = 'png';
        const compName = 'pulsebanner';
        const inputProps = req.body.props;

        res.set('content-type', getMimeType(imageFormat));

        // Calculate a unique identifier for our image,
        // if it exists, return it from cache
        const hash = getImageHash(
            JSON.stringify({
                compName,
                imageFormat,
                inputProps,
            })
        );

        const output = path.join(await tmpDir, hash);

        const webpackBundle = await webpackBundling;
        const puppeteerInstance = await getBrowser();
        const composition = await getComp(compName, inputProps);
        await new Promise<void>((resolve, reject) => {
            renderStill({
                puppeteerInstance,
                composition,
                webpackBundle,
                output,
                inputProps,
                imageFormat,
                onError: (err) => {
                    reject(err);
                },
                envVariables: {},
            })
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });

        const imageBase64 = fs.readFileSync(output, { encoding: 'base64' });

        const endMs = Date.now();

        logger.info(`Done rendering.`, {
            duration: endMs - startMs
        });

        res.send(imageBase64);

        fs.unlinkSync(output);
    })
);

/**
 * Format for what we are going to pass in
 * Req Body
 * TemplateId, Thumbnail URL, Twitch info
 */
// api call (POST) to here sending the required information
app.post('/getProfilePic',
    queueMw,
    handler(async (req, res) => {


        const startMs = Date.now();
        const requestBody = req.body;
        logger.info('Rendering profile picture', requestBody);

        const queueLength = queueMw.queue.getLength();
        if (queueLength > 0) {
            logger.info(`Request queue length: ${queueLength}`);
        }

        // hard coded info as we only use one composition composer and generate different templates from there by passing the different props
        const imageFormat = 'png';
        const compName = 'twitterProfilePic';
        const inputProps = req.body;

        res.set('content-type', getMimeType(imageFormat));

        // Calculate a unique identifier for our image,
        // if it exists, return it from cache
        const hash = getImageHash(
            JSON.stringify({
                compName,
                imageFormat,
                inputProps,
            })
        );

        const output = path.join(await tmpDir, hash);

        const webpackBundle = await webpackBundling;
        const puppeteerInstance = await getBrowser();
        const composition = await getComp(compName, inputProps);
        await new Promise<void>((resolve, reject) => {
            renderStill({
                puppeteerInstance,
                composition,
                webpackBundle,
                output,
                inputProps,
                imageFormat,
                onError: (err) => {
                    reject(err);
                },
                envVariables: {},
            })
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });

        const imageBase64 = fs.readFileSync(output, { encoding: 'base64' });

        const endMs = Date.now();

        logger.info(`Done rendering.`, {
            duration: endMs - startMs
        });

        res.send(imageBase64);

        fs.unlinkSync(output);
    })
);

app.get('/comps', async (req, res) => {
    res.json({ comps: await getCompositions(await webpackBundling) });
});

app.get('/bundle', async (req, res) => {
    webpackBundling = bundle(bundlePath, undefined, {
        webpackOverride: (current) => {
            return {
                ...current,
                resolve: {
                    ...current.resolve,
                    alias: {
                        ...current.resolve?.alias,
                        '@pulsebanner/remotion/components': templatePath,
                    },
                },
            };
        },
    });

    webpackBundling.then(() => {
        logger.info('Done bundling.');
    });

    res.redirect('/comps');
});

app.post('/bundle', (req, res) => {
    webpackBundling = bundle(bundlePath);

    webpackBundling.then(() => {
        logger.info('Done bundling.');
    });

    res.sendStatus(200);
});

app.listen(port);
logger.info(helpText(Number(port)));
logger.info(`Server template path: ${templatePath}`, { templatePath });
