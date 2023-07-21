import { expect } from '@integration/testing-tools';
import { ConfigurationError } from '@serenity-js/core';
import { readFileSync } from 'fs';
import { describe, it } from 'mocha';
import { resolve } from 'path';
import { URL } from 'url';

import { axiosClient } from '../../../src/cli/io';
import { Credentials } from '../../../src/cli/model';

describe('axiosClient', () => {

    const repositoryAuth = new Credentials('username', 'password');
    const repositoryNoAuth = new Credentials(undefined, undefined);

    it('correctly configures the User-Agent if needed', () => {
        const repository = new URL('https://artifactory.example.org');

        const ignoreSsl = false;
        const env = {
            npm_config_user_agent: 'serenity-js'
        }

        const client = axiosClient(repository, ignoreSsl, env, repositoryNoAuth);

        expect(client.defaults.baseURL).to.equal(repository.toString());
        expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
        expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });
        expect(client.defaults.proxy).to.equal(false);
        expect(client.defaults.headers['User-Agent']).to.equal('serenity-js');
    });

    describe('when no proxy is needed', () => {

        const ignoreSsl = false;
        const env = {};

        it('correctly configures the defaults', () => {
            const repository = new URL('https://artifactory.example.org');

            const client = axiosClient(repository, ignoreSsl, env, repositoryNoAuth);

            expect(client.defaults.baseURL).to.equal(repository.toString());
            expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
            expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });
            expect(client.defaults.proxy).to.equal(false);
        });

        it('correctly configures authentication credentials', () => {
            const repository = new URL('https://artifactory.example.org');

            const client = axiosClient(repository, ignoreSsl, env, repositoryAuth);

            expect(client.defaults.baseURL).to.equal(repository.toString());
            expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
            expect(client.defaults.auth).to.deep.equal({
                username: repositoryAuth.username,
                password: repositoryAuth.password,
            });
            expect(client.defaults.proxy).to.equal(false);
        });
    });

    describe('when the artifact registry works over HTTP', () => {

        const repository = new URL('http://artifactory.example.org');
        const ignoreSsl = false;
        const env = {
            HTTP_PROXY: 'http://proxy.example.org'
        };

        it('correctly configures a HTTP proxy', () => {
            const client = axiosClient(repository, ignoreSsl, env, repositoryNoAuth);

            expect(client.defaults.baseURL).to.equal(repository.toString());
            expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
            expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

            expect(client.defaults.proxy).to.deep.equal({
                protocol: 'http:',
                host: 'proxy.example.org',
                port: 80,
                auth: undefined
            });
        });

        it('correctly configures a HTTP proxy with credentials', () => {
            const client = axiosClient(repository, ignoreSsl, {
                HTTP_PROXY: 'http://proxy-user:proxy-password@proxy.example.org'
            }, repositoryNoAuth);

            expect(client.defaults.baseURL).to.equal(repository.toString());
            expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
            expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

            expect(client.defaults.proxy).to.deep.equal({
                protocol: 'http:',
                host: 'proxy.example.org',
                port: 80,
                auth: {
                    password: 'proxy-password',
                    username: 'proxy-user',
                }
            });
        });

        it('complains if the HTTP proxy URL is invalid', () => {
            expect(() => axiosClient(repository, ignoreSsl, { HTTP_PROXY: 'invalid-url' }, repositoryNoAuth))
                .to.throw(ConfigurationError, 'Env variable HTTP_PROXY=invalid-url should specify a valid URL');
        });

        it('complains if the HTTP proxy protocol is not supported', () => {
            expect(() => axiosClient(repository, ignoreSsl, { HTTP_PROXY: 'invalid://localhost' }, repositoryNoAuth))
                .to.throw(ConfigurationError, 'Env variable HTTP_PROXY=invalid://localhost should specify protocol to be used, i.e. http:// or https://');
        });

        it('does not use the proxy if repository is in no_proxy list', () => {
            const client = axiosClient(repository, ignoreSsl, {
                ...env,
                no_proxy: 'artifactory.example.org'
            }, repositoryNoAuth);

            expect(client.defaults.baseURL).to.equal(repository.toString());
            expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
            expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

            expect(client.defaults.proxy).to.equal(undefined);
        });

        it('does not use a proxy if repository domain is in no_proxy list', () => {
            const client = axiosClient(repository, ignoreSsl, {
                ...env,
                no_proxy: '.example.org'
            }, repositoryNoAuth);

            expect(client.defaults.baseURL).to.equal(repository.toString());
            expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
            expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

            expect(client.defaults.proxy).to.equal(undefined);
        });

        it('does not use a proxy if no_proxy set to *', () => {
            const client = axiosClient(repository, ignoreSsl, {
                ...env,
                no_proxy: '*'
            }, repositoryNoAuth);

            expect(client.defaults.baseURL).to.equal(repository.toString());
            expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
            expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

            expect(client.defaults.proxy).to.equal(undefined);
        });
    });

    describe('when the artifact registry works over HTTPS', () => {

        const repository = new URL('https://artifactory.example.org');

        const cafile = resolve(__dirname, 'dummy.ca');
        const ca = readFileSync(cafile).toString('utf8');

        describe('when no proxy is needed', () => {

            it('uses a HTTPS Agent configured to ignore SSL errors', () => {
                const env = { npm_config_ca: ca };
                const ignoreSsl = true;

                const client = axiosClient(repository, ignoreSsl, env, repositoryNoAuth);

                expect(client.defaults.baseURL).to.equal(repository.toString());
                expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
                expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

                expect(client.defaults.proxy).to.equal(false);

                expect(client.defaults.httpsAgent.options.ca).to.equal(ca);
                expect(client.defaults.httpsAgent.options.rejectUnauthorized).to.equal(!ignoreSsl);
            });

            it('uses a HTTPS Agent configured to not ignore SSL errors', () => {
                const env = { npm_config_ca: ca };
                const ignoreSsl = false;

                const client = axiosClient(repository, ignoreSsl, env, repositoryNoAuth);

                expect(client.defaults.baseURL).to.equal(repository.toString());
                expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
                expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

                expect(client.defaults.proxy).to.equal(false);

                expect(client.defaults.httpsAgent.options.ca).to.equal(ca);
                expect(client.defaults.httpsAgent.options.rejectUnauthorized).to.equal(!ignoreSsl);
            });

            it('uses a HTTPS Agent configured without a CA', () => {
                const ignoreSsl = false;
                const env = {};

                const client = axiosClient(repository, ignoreSsl, env, repositoryNoAuth);

                expect(client.defaults.baseURL).to.equal(repository.toString());
                expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
                expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

                expect(client.defaults.proxy).to.equal(false);

                expect(client.defaults.httpsAgent.options.ca).to.equal(undefined);
                expect(client.defaults.httpsAgent.options.rejectUnauthorized).to.equal(true);
            });

            it('uses a HTTPS Agent configured with CA from file', () => {
                const ignoreSsl = false;
                const env = {
                    npm_config_cafile: cafile
                };

                const client = axiosClient(repository, ignoreSsl, env, repositoryNoAuth);

                expect(client.defaults.baseURL).to.equal(repository.toString());
                expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
                expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

                expect(client.defaults.proxy).to.equal(false);

                expect(client.defaults.httpsAgent.options.ca).to.equal(ca);
                expect(client.defaults.httpsAgent.options.rejectUnauthorized).to.equal(true);
            });

            it(`complains if the CA file doesn't exist`, () => {
                const ignoreSsl = false;
                const env = {
                    npm_config_cafile: '/invalid/path/to.ca'
                };

                expect(() => axiosClient(repository, ignoreSsl, env, repositoryNoAuth))
                    .to.throw(ConfigurationError, `Could not read npm_config_cafile at /invalid/path/to.ca`);
            });
        });

        describe('when a proxy is needed', () => {

            it('uses a HttpsProxyAgent with a HTTPS proxy', () => {
                const env = {
                    npm_config_ca: ca,
                    HTTPS_PROXY: 'https://proxy.example.org'
                };
                const ignoreSsl = false;

                const client = axiosClient(repository, ignoreSsl, env, repositoryNoAuth);

                expect(client.defaults.baseURL).to.equal(repository.toString());
                expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
                expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

                expect(client.defaults.proxy).to.equal(false);

                const options = client.defaults.httpsAgent.connectOpts;

                expect(options.ca).to.equal(ca);
                expect(options.rejectUnauthorized).to.equal(!ignoreSsl);
                expect(options.host).to.equal('proxy.example.org');
                expect(options.port).to.equal(443);
            });

            it('uses a HttpsProxyAgent with a HTTP proxy', () => {
                const env = {
                    npm_config_ca: ca,
                    HTTPS_PROXY: 'http://proxy.example.org'
                };
                const ignoreSsl = false;

                const client = axiosClient(repository, ignoreSsl, env, repositoryNoAuth);

                expect(client.defaults.baseURL).to.equal(repository.toString());
                expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
                expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

                expect(client.defaults.proxy).to.equal(false);

                const options = client.defaults.httpsAgent.connectOpts;

                expect(options.ca).to.equal(ca);
                expect(options.rejectUnauthorized).to.equal(!ignoreSsl);
                expect(options.host).to.equal('proxy.example.org');
                expect(options.port).to.equal(80);
            });

            it('uses a HttpsProxyAgent with a HTTP proxy and a custom port', () => {
                const env = {
                    npm_config_ca: ca,
                    HTTPS_PROXY: 'http://proxy.example.org:8080'
                };
                const ignoreSsl = false;

                const client = axiosClient(repository, ignoreSsl, env, repositoryNoAuth);

                expect(client.defaults.baseURL).to.equal(repository.toString());
                expect(client.defaults.adapter).to.deep.equal([ 'http' ]);
                expect(client.defaults.auth).to.deep.equal({ username: undefined, password: undefined });

                expect(client.defaults.proxy).to.equal(false);

                const options = client.defaults.httpsAgent.connectOpts;

                expect(options.ca).to.equal(ca);
                expect(options.rejectUnauthorized).to.equal(!ignoreSsl);
                expect(options.host).to.equal('proxy.example.org');
                expect(options.port).to.equal(8080);
            });
        });
    });
});
