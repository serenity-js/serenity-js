import type { Path } from '@serenity-js/core/io';

import { Cache } from './Cache.js';
import type { FeatureFileMap } from './FeatureFileMap.js';
import type { FeatureFileMapper } from './FeatureFileMapper.js';
import type { FeatureFileParser } from './FeatureFileParser.js';

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
