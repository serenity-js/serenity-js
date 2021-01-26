import 'mocha';

import { expect } from '@integration/testing-tools';
import { Path } from '@serenity-js/core/lib/io';

import { Cache } from '../../../../../src/listeners/legacy/gherkin';

describe('Cache', () => {

    it('starts empty', () => {
        const cache = new Cache();

        expect(cache.size()).to.equal(0);
    });

    it('allows for items to be stored and retrieved', () => {
        const cache = new Cache<Path, number>();

        cache.set(new Path('/home/alice'), 1);
        cache.set(new Path('/home/bob'), 2);

        expect(cache.size()).to.equal(2);
        expect(cache.get(new Path('/home/alice'))).to.equal(1);
        expect(cache.get(new Path('/home/bob'))).to.equal(2);
    });

    it('tells whether or not an item has already been cached', () => {
        const cache = new Cache<Path, number>();

        cache.set(new Path('/home/alice'), 1);

        expect(cache.has(new Path('/home/alice'))).to.equal(true);
        expect(cache.has(new Path('/home/bob'))).to.equal(false);
    });

    it('complains when you try to retrieve an object that has not been cached yet', () => {
        const cache = new Cache<Path, number>();

        expect(() => cache.get(new Path('/home/alice'))).to.throw(
            'Make sure you cache a value under Path(value=/home/alice) before trying to retrieve it',
        );
    });
});
