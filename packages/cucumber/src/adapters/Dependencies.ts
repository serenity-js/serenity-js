import { Path } from '@serenity-js/core/lib/io';
import { Cache, FeatureFileLoader, FeatureFileMap, FeatureFileMapper } from '../gherkin';
import { Notifier } from '../notifier';

export interface Dependencies {
    notifier: Notifier;
    mapper: FeatureFileMapper;
    cache: Cache<Path, FeatureFileMap>;
    loader: FeatureFileLoader;
    cucumber: any;
}
