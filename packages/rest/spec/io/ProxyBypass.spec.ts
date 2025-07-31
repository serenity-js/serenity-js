import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { ProxyBypass } from '../../src/io/ProxyBypass';

describe('ProxyBypass', () => {

    const exampleHttpUrl = new URL('http://example.com/some/path');

    describe('BypassNone', () => {

        it('returns false when the bypass configuration is set to an empty string', () => {
            const bypass = '';
            const proxy = ProxyBypass.create(bypass);

            const result = proxy.matches(exampleHttpUrl);

            expect(result).to.equal(false);
        });

        it('returns false when the bypass configuration is not set', () => {
            const bypass = undefined;
            const proxy = ProxyBypass.create(bypass);

            const result = proxy.matches(exampleHttpUrl);

            expect(result).to.equal(false);
        });
    });

    describe('BypassAll', () => {

        it('returns true when the bypass configuration is set to "*" (all URLs)', () => {
            const bypass = '*';
            const proxy = ProxyBypass.create(bypass);

            const result = proxy.matches(exampleHttpUrl);

            expect(result).to.equal(true);
        });
    });

    describe('BypassMatching', () => {

        given([
            { bypass: 'localhost', url: 'http://localhost', expected: true, description: 'hostname match' },
            { bypass: 'localhost:80', url: 'http://localhost:80', expected: true, description: 'hostname and port match' },
            { bypass: 'localhost:80', url: 'http://localhost:8080', expected: false, description: 'port mismatch' },
            { bypass: 'localhost', url: 'http://localhost:8080', expected: true, description: 'no port in bypass, port match' },
            { bypass: 'localhost', url: 'http://example.com', expected: false, description: 'hostname mismatch' },
            { bypass: 'example.com', url: 'http://api.example.com', expected: true, description: 'subdomain match' },
            { bypass: '.example.com', url: 'http://api.example.com', expected: true, description: '.subdomain match' },
            { bypass: 'localhost:443, localhost:8080', url: 'http://localhost', expected: false, description: 'bypass multiple: port mismatch' },
            { bypass: 'localhost:443, localhost:8080', url: 'http://localhost:8080', expected: true, description: 'bypass multiple: port match' },
            { bypass: '127.0.0.1', url: 'http://127.0.0.1', expected: true, description: 'hostname match for IP address' },
        ]).it('bypasses URLs matching the configuration', ({ bypass, url, expected, description }) => {
            const proxy = ProxyBypass.create(bypass);
            const testUrl = new URL(url);

            const result = proxy.matches(testUrl);

            expect(result, description).to.equal(expected);
        });
    });
});
