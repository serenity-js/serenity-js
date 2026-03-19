import type { Serenity } from '@serenity-js/core';
import { ConfigurationError } from '@serenity-js/core';
import type { ModuleLoader, Path } from '@serenity-js/core/io';

import cucumber0 from './cucumber-0.js';
import cucumber1 from './cucumber-1.js';
import cucumber2 from './cucumber-2.js';
import cucumber3 from './cucumber-3.js';
import cucumber4 from './cucumber-4.js';
import cucumber5 from './cucumber-5.js';
import cucumber6 from './cucumber-6.js';
import type { FeatureFileMap} from './gherkin/index.js';
import { Cache, FeatureFileLoader, FeatureFileMapper, FeatureFileParser, GherkinParserAdapter } from './gherkin/index.js';
import { Notifier, ResultMapper } from './notifier/index.js';

const cucumberVersions: Record<number, (deps: any) => any> = {
    0: cucumber0,
    1: cucumber1,
    2: cucumber2,
    3: cucumber3,
    4: cucumber4,
    5: cucumber5,
    6: cucumber6,
};

/**
 * Creates a listener for Cucumber.js 0.x-6.x
 *
 * @param serenity
 * @param moduleLoader
 */
export function createListener(serenity: Serenity, moduleLoader: ModuleLoader): any {

    const version  = moduleLoader.versionOf('cucumber');

    try {
        const
            cucumber        = moduleLoader.require('cucumber'),
            notifier         = new Notifier(serenity),
            mapper          = new FeatureFileMapper(),
            resultMapper    = new ResultMapper(serenity),
            cache           = new Cache<Path, FeatureFileMap>(),
            loader          = new FeatureFileLoader(
                new FeatureFileParser(new GherkinParserAdapter()),
                mapper,
                cache,
            );

        const cucumberAdapter = cucumberVersions[version.major()];
        if (!cucumberAdapter) {
            throw new Error(`Unsupported Cucumber version: ${ version.major() }`);
        }

        return cucumberAdapter({
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
        throw new ConfigurationError(`Cucumber version ${ version.toString() } is not supported yet`, error);
    }
}
