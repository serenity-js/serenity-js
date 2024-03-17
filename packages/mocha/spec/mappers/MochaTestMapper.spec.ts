import { expect } from '@integration/testing-tools';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { ArbitraryTag, Category, Name, ScenarioDetails } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { MochaTestMapper } from '../../src/mappers';
import { exampleTest } from '../exampleTest';

describe('MochaTestMapper', () => {

    const mapper = new MochaTestMapper(new Path('/fake/path'));

    it('treats the outer-most describe as the name of the feature', () => {
        const feature = mapper.featureNameFor(exampleTest)

        expect(feature).to.equal('Mocha reporting');
    });

    it('maps a Mocha test to Serenity/JS ScenarioDetails', () => {
        const { scenarioDetails, scenarioTags } = mapper.detailsOf(exampleTest)

        expect(scenarioDetails).to.equal(new ScenarioDetails(
            new Name('A scenario passes'),
            new Category('Mocha reporting'),
            new FileSystemLocation(new Path('/fake/path/serenity-js/integration/mocha/examples/passing.spec.js'))
        ));

        expect(scenarioTags).to.deep.equal([
            new ArbitraryTag('smoke-test')
        ]);
    });
});
