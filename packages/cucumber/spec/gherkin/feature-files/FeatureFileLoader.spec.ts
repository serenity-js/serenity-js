import 'mocha';

import { expect } from '@integration/testing-tools';
import { Path } from '@serenity-js/core/lib/io';
import { Description, Name, ScenarioParameters } from '@serenity-js/core/lib/model';
import Gherkin = require('gherkin');
import * as sinon from 'sinon';

import { FeatureFileLoader, FeatureFileMapper, FeatureFileParser } from '../../../src/gherkin'; // ts-node:disable-line:no-var-requires     No type definitions available

describe('FeatureFileLoader', () => {

    const sampleFeature = new Path(__dirname).join(new Path('fixtures')).join(new Path('sample.feature'));

    it('caches the feature file map it has loaded', () => {

        const
            parser = new FeatureFileParser(new Gherkin.Parser()),
            mapper = new FeatureFileMapper(),
            cache = new WeakMap();

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
