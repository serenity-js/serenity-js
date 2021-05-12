import 'mocha';

import { expect } from '@integration/testing-tools';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { Category, Name, ScenarioDetails } from '@serenity-js/core/lib/model';

import { MochaTestMapper } from '../../src/mappers';
import { exampleTest } from '../exampleTest';

describe('MochaTestMapper', () => {

    const mapper = new MochaTestMapper();

    it('treats the outer-most describe as the name of the feature', () => {
        const feature = mapper.featureNameFor(exampleTest)

        expect(feature).to.equal('Mocha reporting');
    });

    it('maps a Mocha test to Serenity/JS ScenarioDetails', () => {
        const scenario = mapper.detailsOf(exampleTest)

        expect(scenario).to.equal(new ScenarioDetails(
            new Name('A scenario passes'),
            new Category('Mocha reporting'),
            new FileSystemLocation(new Path('/Users/jan/Projects/serenity-js/integration/mocha/examples/passing.spec.js'))
        ));
    });
});
