import { Serenity } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';

import { Cache, FeatureFileLoader, FeatureFileMap, FeatureFileMapper } from './gherkin';
import { Notifier, ResultMapper } from './notifier';

/**
 * @private
 */
export interface Dependencies {
    serenity: Serenity;
    notifier: Notifier;
    mapper: FeatureFileMapper;
    resultMapper: ResultMapper
    cache: Cache<Path, FeatureFileMap>;
    loader: FeatureFileLoader;
    cucumber: any;
}
