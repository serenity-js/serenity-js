const { Joi } = require('@docusaurus/utils-validation');
const logger = require('@docusaurus/logger');
const fs = require('fs-extra');
const glob = require('fast-glob');
const path = require('path');

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @returns {import('@docusaurus/types').Plugin}
 */
async function MetadataPlugin(context, options) {

    const { projectRoot, include } = options;

    const input = include.map(pattern =>
        path.join(projectRoot, pattern, `package.json`)
    );

    const integrationsOfInterest = [
        'axios',
        '@cucumber/cucumber',
        'cucumber',
        'jasmine',
        'mocha',
        'playwright-core',
        '@playwright/test',
        'protractor',
        '@wdio/cli',
        'webdriverio',
    ];

    return {
        name: 'docusaurus-plugin-serenity-js-metadata',

        async postBuild({ siteConfig, routesPaths, outDir, head }) {

            // add v1

            const paths = await glob(input, { onlyFiles: false, globstar: true, absolute: true });

            const packages = {};
            let integrations = {};

            for (const pathToPackageJSON of paths) {
                const serenityPackage = JSON.parse(fs.readFileSync(pathToPackageJSON).toString('utf8'));

                const dependencies = {
                    ...serenityPackage.dependencies,
                    ...serenityPackage.peerDependencies,
                };

                const packageIntegrations = Object.keys(dependencies)
                    .filter(dependency => integrationsOfInterest.includes(dependency))
                    .reduce((acc, key) => {
                        acc[key] = dependencies[key];
                        return acc;
                    }, {});

                integrations = {
                    ...integrations,
                    ...packageIntegrations,
                }

                packages[serenityPackage.name] = serenityPackage.version;
            }

            try {
                const content = JSON.stringify({
                    packages,
                    integrations
                }, undefined, 0);

                const pathToInfoFile = path.join(outDir, 'meta', 'v1', 'info.json');
                await fs.outputFile(pathToInfoFile, content);

                logger.info`Wrote meta/v1/info.json`;
            }
            catch (err) {
                logger.error`Writing meta/v1/info.json failed: ${ err.message || err }`;

                throw err;
            }
        }
    };
}

const pluginOptionsSchema = Joi.object({
    projectRoot: Joi.string().required(),
    include:     Joi.array().items(Joi.string()).default([]),
});

function validateOptions({ validate, options }) {
    return validate(pluginOptionsSchema, options);
}

MetadataPlugin.validateOptions = validateOptions;

module.exports = MetadataPlugin;
