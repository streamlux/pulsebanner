import path from 'path';
import { Config } from 'remotion';
import dotenv from 'dotenv';

dotenv.config({
    path: '../../.env'
});

const templatePath = path.resolve(process.cwd(), 'libs/templates/src/index');
console.log('templatePath', templatePath);
Config.Rendering.setImageFormat('png');
Config.Output.setOverwriteOutput(true);
Config.Bundling.overrideWebpackConfig((current) => {
    return {
        ...current,
        resolve: {
            ...current.resolve,
            alias: {
                ...current.resolve?.alias,
                '@pulsebanner/templates': templatePath
            }
        }
    }
});
