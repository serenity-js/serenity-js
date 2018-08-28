import 'mocha';

import { expect } from '@integration/testing-tools';
import { Description, Name } from '@serenity-js/core/lib/model';

import { FeatureFileMap } from '../../../src/gherkin';

describe('FeatureFileMap', () => {

    const
        featureName = new Description('some feature');

    it('allows for values to be stored and retrieved', () => {
        const map = new FeatureFileMap()
            .set(featureName).onLine(1);

        expect(map.get(Description).onLine(1)).to.equal(featureName);
    });

    it('allows for values to be retrieved based on their type when their location is not known', () => {
        const map = new FeatureFileMap()
            .set(featureName).onLine(1);

        expect(map.getFirst(Description)).to.equal(featureName);
    });

    it('allows for values to be retrieved based on the line alone', () => {
        const map = new FeatureFileMap()
            .set(featureName).onLine(1);

        expect(map.get(Description).onLine(1)).to.equal(featureName);
    });

    it('complains if the value stored is not of the same type as value that needs to be retrieved', () => {
        const map = new FeatureFileMap()
            .set(featureName).onLine(1);

        expect(() => map.get(Name).onLine(1)).to.throw('Item on line 1 is a Description, not a Name');
    });

    it('complains if the requested value is not present', () => {
        const map = new FeatureFileMap();

        expect(() => map.get(Name).onLine(1)).to.throw('Nothing was found on line 1');
        expect(() => map.getFirst(Name)).to.throw(`Didn't find any Name amongst no items`);
    });
});
