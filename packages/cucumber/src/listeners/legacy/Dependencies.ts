import { Serenity } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { Cache, FeatureFileLoader, FeatureFileMap, FeatureFileMapper } from './gherkin';
import { Notifier } from './notifier';

/**
 * @private
 */
export interface Dependencies {
    serenity: Serenity;
    notifier: Notifier;
    mapper: FeatureFileMapper;
    cache: Cache<Path, FeatureFileMap>;
    loader: FeatureFileLoader;
    cucumber: any;
}
