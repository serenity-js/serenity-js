import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { Version } from '../../src/io';
import { expect } from '../expect';

describe('Version', () => {

    it('represents a comparable version number', () => {
        expect(new Version('1.2.3').isAtLeast(new Version('1.0.0'))).to.equal(true);
    });

    it('tells the major version number', () => {
        expect(new Version('1.2.3').major()).to.equal(1);
    });

    it('provides a sensible description', () => {
        expect(new Version('1.2.3').toString()).to.equal('1.2.3');
    });

    given([
        { range: '1.x', expected: true },
        { range: '0.x || >=1.2', expected: true },
        { range: '^1', expected: true },
        { range: '0.x || 2.x', expected: false },
    ]).
    it('checks if the version satisfies a given range', ({ range, expected }) => {
        expect(new Version('1.2.3').satisfies(range)).to.equal(expected);
    });

    it('can be created from a JSON string', () => {
        expect(Version.fromJSON('1.2.3')).to.equal(new Version('1.2.3'));
    });
});
