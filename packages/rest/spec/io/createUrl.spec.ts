import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { createUrl } from '../../src/io/createUrl';
import { expect } from '../expect';

describe('createUrl', () => {

    given([
        {
            description: 'default port for HTTP gets ignored',
            options: {
                protocol: 'http',
                hostname: 'example.org',
                port: '80',
            },
            expected: 'http://example.org/'
        },
        {
            description: 'default port for HTTPs gets ignored',
            options: {
                protocol: 'https',
                hostname: 'example.org',
                port: '443',
            },
            expected: 'https://example.org/'
        },
        {
            description: 'non-default HTTP port gets added',
            options: {
                protocol: 'http',
                hostname: 'example.org',
                port: '8080',
            },
            expected: 'http://example.org:8080/'
        },
        {
            description: 'non-default HTTPs port gets added',
            options: {
                protocol: 'https',
                hostname: 'example.org',
                port: '8443',
            },
            expected: 'https://example.org:8443/'
        },
    ]).
    it('should create a URL when given valid configuration', ({ options, expected }) => {

        const url = createUrl(options);

        expect(url.toString()).equals(expected);
    });

    describe('when the protocol is undefined', () => {

        it('defaults to HTTP', () => {

            const url = createUrl({ protocol: undefined, hostname: 'example.org', port: 80 });

            expect(url.toString()).equals('http://example.org/');
        });

        it(`defaults to port 80 when port is not specified`, () => {

            const url = createUrl({ protocol: undefined, hostname: 'example.org', port: undefined });

            expect(url.toString()).equals('http://example.org/');
        });
    });

    given([
        'https://',
        'https:',
        'https',
        'HTTPS://',
        'HTTPS:',
        'HTTPS',
    ]).
    it('cleans up the protocol name', (protocol) => {

        const url = createUrl({ protocol, hostname: `example.org`, port: undefined });

        expect(url.protocol).to.equal('https:');
        expect(url.toString()).to.equal('https://example.org/');
    });

    describe('when dealing with credentials', () => {

        it('adds the url-encoded username to the resulting url', () => {
            const url = createUrl({
                protocol: 'https',
                hostname: 'example.org',
                username: 'alice.jones@example.org'
            });

            expect(url.username).to.equal('alice.jones%40example.org');
            expect(url.toString()).to.equal('https://alice.jones%40example.org@example.org/');
        });

        it('adds the url-encoded username and password to the resulting url', () => {
            const url = createUrl({
                protocol: 'https',
                hostname: `example.org`,
                username: 'alice.jones@example.org',
                password: '//P@55w0rd!'
            });

            expect(url.username).to.equal('alice.jones%40example.org');
            expect(url.password).to.equal('%2F%2FP%4055w0rd!');
            expect(url.toString()).to.equal('https://alice.jones%40example.org:%2F%2FP%4055w0rd!@example.org/');
        });
    });

    describe('when handling errors', () => {

        it('complains when the hostname is not specified', () => {
            expect(() => {
                createUrl({ protocol: 'http', hostname: undefined, port: undefined });
            }).to.throw(Error, 'hostname should be a string');
        });

        it('complains when the hostname is blank', () => {
            expect(() => {
                createUrl({ protocol: 'http', hostname: '', port: undefined });
            }).to.throw(Error, 'hostname should not be blank');
        });
    });
});
