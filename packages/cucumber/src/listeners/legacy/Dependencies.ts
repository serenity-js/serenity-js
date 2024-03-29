import type { Serenity } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';

import type { Cache, FeatureFileLoader, FeatureFileMap, FeatureFileMapper } from './gherkin';
import type { Notifier, ResultMapper } from './notifier';

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
