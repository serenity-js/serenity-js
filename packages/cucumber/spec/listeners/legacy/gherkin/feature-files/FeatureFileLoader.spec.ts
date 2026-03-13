import { fileURLToPath } from 'node:url';

import { expect } from '@integration/testing-tools';
import { Path } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import type { FeatureFileMap} from '../../../../../src/listeners/legacy/gherkin/index.js';
import { Cache, FeatureFileLoader, FeatureFileMapper, FeatureFileParser, GherkinParserAdapter } from '../../../../../src/listeners/legacy/gherkin/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('FeatureFileLoader', () => {

    const sampleFeature = new Path(__dirname).join(new Path('fixtures')).join(new Path('sample.feature'));

    it('caches the feature file map it has loaded', () => {

        const
            parser = new FeatureFileParser(new GherkinParserAdapter()),
            mapper = new FeatureFileMapper(),
            cache  = new Cache<Path, FeatureFileMap>();

        const
            parse = sinon.spy(parser, 'parse'),
            map = sinon.spy(mapper, 'map');

        const loader = new FeatureFileLoader(
            parser,
            mapper,
            cache,
        );

        return loader.load(sampleFeature)
            .then(_ => loader.load(sampleFeature))
            .then(_ => loader.load(sampleFeature))
            .then(_ => {
                expect(cache.has(sampleFeature)).to.equal(true);

                expect(parse.callCount).to.equal(1);
                expect(map.callCount).to.equal(1);
            });
    });
});
