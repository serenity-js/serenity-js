import { ConfigurationError, Serenity } from '@serenity-js/core';
import { ModuleLoader, Path } from '@serenity-js/core/lib/io';

import Gherkin = require('gherkin');

import { Cache, FeatureFileLoader, FeatureFileMap, FeatureFileMapper, FeatureFileParser } from './gherkin';
import { Notifier, ResultMapper } from './notifier';

/**
 * @desc
 *  Creates a listener for Cucumber.js 0.x-6.x
 *
 * @param {@serenity-js/core/lib~Serenity} serenity
 * @param {@serenity-js/core/lib/io~ModuleLoader} moduleLoader
 * @returns {cucumber~Formatter}
 */
export function createListener(serenity: Serenity, moduleLoader: ModuleLoader): any {

    const version  = moduleLoader.versionOf('cucumber');

    try {
        const
            cucumber        = moduleLoader.require('cucumber'),
            notifier        = new Notifier(serenity),
            mapper          = new FeatureFileMapper(),
            resultMapper    = new ResultMapper(),
            cache           = new Cache<Path, FeatureFileMap>(),
            loader          = new FeatureFileLoader(
                new FeatureFileParser(new Gherkin.Parser()),
                mapper,
                cache,
            );

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(`./cucumber-${ version.major() }`)({
            serenity,
            notifier,
            mapper,
            resultMapper,
            cache,
            loader,
            cucumber,
        });
    }
    catch (error) {
        throw new ConfigurationError(`Cucumber version ${ version.toString() } is not supported yet.`, error);
    }
}
