import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import { isNodeVersionSupported, SUPPORTED_NODE_RANGE } from '../../../src';

describe('NodeVersion', () => {

    describe('SUPPORTED_NODE_RANGE', () => {

        it('defines the supported Node.js version range', () => {
            expect(SUPPORTED_NODE_RANGE).to.equal('^20 || ^22 || ^24');
        });
    });

    describe('isNodeVersionSupported', () => {

        it('returns true for Node.js 20.x', () => {
            expect(isNodeVersionSupported('v20.0.0')).to.equal(true);
            expect(isNodeVersionSupported('v20.15.1')).to.equal(true);
            expect(isNodeVersionSupported('v20.99.99')).to.equal(true);
        });

        it('returns true for Node.js 22.x', () => {
            expect(isNodeVersionSupported('v22.0.0')).to.equal(true);
            expect(isNodeVersionSupported('v22.11.0')).to.equal(true);
            expect(isNodeVersionSupported('v22.99.99')).to.equal(true);
        });

        it('returns true for Node.js 24.x', () => {
            expect(isNodeVersionSupported('v24.0.0')).to.equal(true);
            expect(isNodeVersionSupported('v24.5.0')).to.equal(true);
        });

        it('returns false for Node.js 18.x (too old)', () => {
            expect(isNodeVersionSupported('v18.0.0')).to.equal(false);
            expect(isNodeVersionSupported('v18.20.0')).to.equal(false);
        });

        it('returns false for Node.js 19.x (odd version)', () => {
            expect(isNodeVersionSupported('v19.0.0')).to.equal(false);
            expect(isNodeVersionSupported('v19.9.0')).to.equal(false);
        });

        it('returns false for Node.js 21.x (odd version)', () => {
            expect(isNodeVersionSupported('v21.0.0')).to.equal(false);
            expect(isNodeVersionSupported('v21.7.0')).to.equal(false);
        });

        it('returns false for Node.js 23.x (odd version)', () => {
            expect(isNodeVersionSupported('v23.0.0')).to.equal(false);
            expect(isNodeVersionSupported('v23.5.0')).to.equal(false);
        });

        it('handles version strings without v prefix', () => {
            expect(isNodeVersionSupported('20.0.0')).to.equal(true);
            expect(isNodeVersionSupported('22.11.0')).to.equal(true);
            expect(isNodeVersionSupported('18.0.0')).to.equal(false);
        });
    });
});
