import 'mocha';

import { Version } from '../../src/io';
import { expect } from '../expect';

describe('Version', () => {

    it('represents a comparable version number', () => {
        expect(new Version('1.2.3').isAtLeast(new Version('1.0.0'))).to.equal(true);
    });

    it('grants access to the major version number', () => {
        expect(new Version('1.2.3').major()).to.equal(1);
    });

    it('provides a sensible description', () => {
        expect(new Version('1.2.3').toString()).to.equal('1.2.3');
    });
});
