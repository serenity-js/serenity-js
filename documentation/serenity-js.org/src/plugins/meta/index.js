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

    return {
        name: 'docusaurus-plugin-serenity-js-metadata',

        async postBuild({ siteConfig, routesPaths, outDir, head }) {

            const paths = await glob(input, { onlyFiles: false, globstar: true, absolute: true });
            const metadata = {
                packages: {},
            };

            for (const pathToPackageJSON of paths) {
                const serenityPackage = JSON.parse(fs.readFileSync(pathToPackageJSON).toString('utf8'));
                metadata.packages[serenityPackage.name] = { version: serenityPackage.version };
            }

            try {
                const content = JSON.stringify(metadata, undefined, 0);

                const pathToInfoFile = path.join(outDir, 'meta', 'info.json');
                await fs.outputFile(pathToInfoFile, content);
            } catch (err) {
                logger.error('Writing version.json failed.');
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
