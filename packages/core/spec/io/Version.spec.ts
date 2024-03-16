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

    given([
        { version: '1.2.2', expected: true },
        { version: '1.2.3', expected: false },
        { version: '1.2.4', expected: false },
    ]).
    it('tells if it is lower than another version', ({ version, expected }) => {
        expect(new Version(version).isLowerThan(new Version('1.2.3'))).to.equal(expected);
    });

    given([
        { version: '1.2.2', expected: true },
        { version: '1.2.3', expected: true },
        { version: '1.2.4', expected: false },
    ]).
    it('tells if it is at most another version', ({ version, expected }) => {
        expect(new Version(version).isAtMost(new Version('1.2.3'))).to.equal(expected);
    });

    given([
        { version: '1.2.2', expected: false },
        { version: '1.2.3', expected: true },
        { version: '1.2.4', expected: true },
    ]).
    it('tells if it is at least another version', ({ version, expected }) => {
        expect(new Version(version).isAtLeast(new Version('1.2.3'))).to.equal(expected);
    });

    given([
        { version: '1.2.2', expected: false },
        { version: '1.2.3', expected: false },
        { version: '1.2.4', expected: true },
    ]).
    it('tells if it is higher than another version', ({ version, expected }) => {
        expect(new Version(version).isHigherThan(new Version('1.2.3'))).to.equal(expected);
    });

    it('tells if it is equal to another version', () => {
        expect(new Version('1.2.3').equals(new Version('1.2.3'))).to.equal(true);
    });

    it('can be created from a JSON string', () => {
        expect(Version.fromJSON('1.2.3')).to.equal(new Version('1.2.3'));
    });
});
