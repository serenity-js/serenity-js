import 'mocha';

import { expect } from '@integration/testing-tools';
import { given } from 'mocha-testdata';

import { MacAddress } from '../../src/io/MacAddress.js';

describe('MacAddress', () => {

    given([
        `01:00:5e:00:00:00`,
        `33:33:00:00:00:00`
    ]).
    it('should recognise a multicast address', (address) => {
        expect(new MacAddress(address).isMulticast()).to.equal(true);
    });

    given([
        `02:00:00:00:00:00`,
        `06:00:00:00:00:00`,
        `0a:00:00:00:00:00`,
        `0e:00:00:00:00:00`
    ]).
    it('should recognise a locally administered address', (address) => {
        expect(new MacAddress(address).isLocallyAdministered()).to.equal(true);
    });

    given([
        `ff:ff:ff:ff:ff:ff`
    ]).
    it('should recognise a broadcast address', (address) => {
        expect(new MacAddress(address).isBroadcast()).to.equal(true);
    });

    given([
        `00:00:00:00:00:00`
    ]).
    it('should recognise a placeholder address', (address) => {
        expect(new MacAddress(address).isPlaceholder()).to.equal(true);
    });

    given([
        { address: `00:1a:2b:3c:4d:5e`, expected: true },
        { address: `00:00:00:00:00:00`, expected: false },
        { address: `01:00:5e:00:00:00`, expected: false },
        { address: `33:33:00:00:00:00`, expected: false },
        { address: `02:00:00:00:00:00`, expected: false },
        { address: `06:00:00:00:00:00`, expected: false },
        { address: `0a:00:00:00:00:00`, expected: false },
        { address: `0e:00:00:00:00:00`, expected: false },
        { address: `ff:ff:ff:ff:ff:ff`, expected: false },
    ]).
    it('should recognise a unique address', ({ address, expected }) => {
        expect(new MacAddress(address).isUnique()).to.equal(expected);
    });

    it('represents a MAC address as a lower-case string', () => {
        const address = new MacAddress(`00:1A:2B:3C:4D:5E`);

        expect(address.toString()).to.equal('00:1a:2b:3c:4d:5e');
    });
});
