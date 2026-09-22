import { describe, it } from 'mocha';

import { isHidden, isSilent } from '../../../src';
import { expect } from '../../expect';

describe('Reporting markers', () => {

    describe('isHidden', () => {

        it('is true when the activity declares itself as hidden', () => {
            expect(isHidden({ isHidden: () => true })).to.equal(true);
        });

        it('is false when the activity declares itself as not hidden', () => {
            expect(isHidden({ isHidden: () => false })).to.equal(false);
        });

        it('is false when the activity does not implement IsHidden', () => {
            expect(isHidden({})).to.equal(false);
            expect(isHidden(undefined)).to.equal(false);
        });
    });

    describe('isSilent', () => {

        it('is true when the activity declares itself as silent', () => {
            expect(isSilent({ isSilent: () => true })).to.equal(true);
        });

        it('is false when the activity declares itself as not silent', () => {
            expect(isSilent({ isSilent: () => false })).to.equal(false);
        });

        it('is false when the activity does not implement IsSilent', () => {
            expect(isSilent({})).to.equal(false);
            expect(isSilent(undefined)).to.equal(false);
        });
    });
});
