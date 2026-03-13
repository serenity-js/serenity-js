import type { Serenity } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io/index.js';

import type { Cache, FeatureFileLoader, FeatureFileMap, FeatureFileMapper } from './gherkin/index.js';
import type { Notifier, ResultMapper } from './notifier/index.js';

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
