import { Path } from '@serenity-js/core/lib/io';

import { Cache } from './Cache';
import { FeatureFileMap } from './FeatureFileMap';
import { FeatureFileMapper } from './FeatureFileMapper';
import { FeatureFileParser } from './FeatureFileParser';

/**
 * @private
 */
export class FeatureFileLoader {
    constructor(
        private readonly parser: FeatureFileParser,
        private readonly mapper: FeatureFileMapper,
        private readonly cache: Cache<Path, FeatureFileMap> = new Cache(),
    ) {
    }

    load(path: Path): Promise<FeatureFileMap> {
        if (this.cache.has(path)) {
            return Promise.resolve(this.cache.get(path));
        }

        return this.parser.parse(path)
            .then(document => this.mapper.map(document, path))
            .then(map => {
                this.cache.set(path, map);
                return this.cache.get(path);
            });
    }
}
