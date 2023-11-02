import * as gherkin from '@cucumber/gherkin';
import * as messages from '@cucumber/messages';
import { expect } from '@integration/testing-tools';
import { Path } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import type { FeatureFileMap } from '../../../../../src/listeners/legacy/gherkin';
import {
    Cache,
    FeatureFileLoader,
    FeatureFileMapper,
    FeatureFileParser
} from '../../../../../src/listeners/legacy/gherkin';

describe('FeatureFileLoader', () => {

    const sampleFeature = new Path(__dirname).join(new Path('fixtures')).join(new Path('sample.feature'));

    it('caches the feature file map it has loaded', async () => {

        const uuidGenerator = messages.IdGenerator.uuid();
        const builder = new gherkin.AstBuilder(uuidGenerator);
        const matcher = new gherkin.GherkinClassicTokenMatcher();

        const parser = new FeatureFileParser(new gherkin.Parser(builder, matcher));
        const mapper = new FeatureFileMapper();
        const cache  = new Cache<Path, FeatureFileMap>();

        const parse = sinon.spy(parser, 'parse');
        const map = sinon.spy(mapper, 'map');

        const loader = new FeatureFileLoader(
            parser,
            mapper,
            cache,
        );

        await loader.load(sampleFeature);
        await loader.load(sampleFeature);
        await loader.load(sampleFeature);

        expect(cache.has(sampleFeature)).to.equal(true);

        expect(parse.callCount).to.equal(1);
        expect(map.callCount).to.equal(1);
    });
});
