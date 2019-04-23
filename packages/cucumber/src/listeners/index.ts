import { ConfigurationError, Serenity } from '@serenity-js/core';
import { Path, Version } from '@serenity-js/core/lib/io';

import Gherkin = require('gherkin');

import { Cache, FeatureFileLoader, FeatureFileMap, FeatureFileMapper, FeatureFileParser } from '../gherkin';
import { Notifier } from '../notifier';

export function listenerForCucumber(version: Version, cucumber: any, serenity: Serenity) {

    try {
        const
            notifier = new Notifier(serenity),
            mapper   = new FeatureFileMapper(),
            cache    = new Cache<Path, FeatureFileMap>(),
            loader   = new FeatureFileLoader(
                new FeatureFileParser(new Gherkin.Parser()),
                mapper,
                cache,
            );

        return require(`./cucumber-${ version.major() }`)({
            notifier,
            mapper,
            cache,
            loader,
            cucumber,
        });
    }
    catch (error) {
        throw new ConfigurationError(`Cucumber version ${ version.toString() } is not supported yet.`, error);
    }
}
