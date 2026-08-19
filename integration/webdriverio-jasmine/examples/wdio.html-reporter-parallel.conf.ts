import path from 'node:path';

import { config as baseConfig } from './wdio.conf';

const outputDirectory = path.resolve(__dirname, '..', 'target', 'html-report-parallel');

export const config: typeof baseConfig = {
    ...baseConfig,

    serenity: {
        ...baseConfig.serenity,
        crew: [
            ['@serenity-js/html-reporter', {
                outputDirectory,
            }],
        ],
    },

    maxInstances: 2,

    logLevel: 'warn',
};
