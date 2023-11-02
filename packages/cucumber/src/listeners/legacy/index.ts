import * as gherkin from '@cucumber/gherkin';
import * as messages from '@cucumber/messages';
import type { Serenity } from '@serenity-js/core';
import { ConfigurationError } from '@serenity-js/core';
import type { ModuleLoader, Path } from '@serenity-js/core/lib/io';

import type { FeatureFileMap} from './gherkin';
import { Cache, FeatureFileLoader, FeatureFileMapper, FeatureFileParser } from './gherkin';
import { Notifier, ResultMapper } from './notifier';

/**
 * Creates a listener for Cucumber.js 0.x-6.x
 *
 * @param serenity
 * @param moduleLoader
 */
export function createListener(serenity: Serenity, moduleLoader: ModuleLoader): any {

    const version  = moduleLoader.versionOf('cucumber');

    try {
        const uuidGenerator = messages.IdGenerator.uuid();
        const builder = new gherkin.AstBuilder(uuidGenerator);
        const matcher = new gherkin.GherkinClassicTokenMatcher();
        const parser = new gherkin.Parser(builder, matcher);

        const
            cucumber        = moduleLoader.require('cucumber'),
            notifier        = new Notifier(serenity),
            mapper          = new FeatureFileMapper(),
            resultMapper    = new ResultMapper(serenity),
            cache           = new Cache<Path, FeatureFileMap>(),
            loader          = new FeatureFileLoader(
                new FeatureFileParser(parser),
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
