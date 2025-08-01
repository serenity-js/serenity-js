import { expect } from '@integration/testing-tools';
import axios from 'axios';
import { describe, it } from 'mocha';

import { axiosProxyOverridesFor } from '../../src/io/proxy';
import { ProxyAgent } from '../../src/io/ProxyAgent';

describe('proxy', () => {

    describe('axiosProxyOverridesFor', () => {

        describe('when no proxy overrides are defined', () => {

            it('overrides Axios built-in proxy mechanism to use env variables', () => {

                const overrides = axiosProxyOverridesFor(axios.create({}).defaults);

                expect(overrides.proxy).to.equal(false);
                expect(overrides.httpAgent).to.be.instanceof(ProxyAgent);
                expect(overrides.httpsAgent).to.be.instanceof(ProxyAgent);
            });
        });

        describe('when proxy overrides are defined', () => {

            it('creates an Axios instance that overrides Axios built-in proxy mechanism', () => {

                const overrides = axiosProxyOverridesFor(axios.create({
                    proxy: {
                        protocol: 'http',
                        host: 'proxy.mycompany.com',
                        port: 9000,
                    }
                }).defaults);

                expect(overrides.proxy).to.equal(false);
                expect(overrides.httpAgent).to.be.instanceof(ProxyAgent);
                expect(overrides.httpsAgent).to.be.instanceof(ProxyAgent);
            });
        });
    });

});
