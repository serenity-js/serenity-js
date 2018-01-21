import 'mocha';

import axios, { AxiosInstance } from 'axios';
import AxiosMockAdapter = require('axios-mock-adapter');

import { CallAnApi } from '../../../src/screenplay/abilities';
import { expect } from '../../expect';

describe('Abilities', () => {

    const baseURL = 'https://dum.my';

    describe('Call an Api', () => {
        const axiosInstance: AxiosInstance = axios.create({baseURL});

        const dummyApi = new AxiosMockAdapter(axiosInstance);

        const callAnApi = CallAnApi.using(axiosInstance);

        after(() => dummyApi.restore());

        describe('performs a get on a resource and gets 200', () => {

            const resource = '/get200';

            dummyApi
                .onGet(resource)
                .reply(200, {
                    username: '1337',
                });

            before(() => expect(callAnApi.get(resource)).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 200', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(200)));
            it('and LastResponse has data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.not.be.empty));
        });

        describe('performs a get on a resource and gets 404', () => {
            const resource = '/get404';

            dummyApi
                .onGet(resource)
                .reply(404);

            before(() => expect(callAnApi.get(resource)).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 404', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(404)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.undefined));
        });

        describe('performs a post on a resource and gets 201', () => {
            const resource = '/post201';

            dummyApi
                .onPost(resource, {
                    username: '1337',
                })
                .reply(201);

            before(() => expect(callAnApi.post(resource, {username: '1337'})).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 201', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(201)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.undefined));
        });

        describe('performs a post on a resource and gets 403', () => {
            const resource = '/post403';

            dummyApi
                .onPost(resource)
                .reply(403);

            before(() => expect(callAnApi.post(resource, {username: '1337'})).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 403', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(403)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.undefined));
        });

        describe('performs a delete on a resource and gets 200', () => {

            const resource = '/delete200';

            dummyApi
                .onDelete(resource)
                .reply(200, {
                    username: '1337',
                });

            before(() => expect(callAnApi.delete(resource)).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 200', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(200)));
            it('and LastResponse has data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.not.be.empty));
        });

        describe('performs a delete on a resource and gets 404', () => {
            const resource = '/delete404';

            dummyApi
                .onDelete(resource)
                .reply(404);

            before(() => expect(callAnApi.delete(resource)).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 404', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(404)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.undefined));
        });

        describe('performs a put on a resource and gets 200', () => {

            const resource = '/put200';

            dummyApi
                .onPut(resource)
                .reply(200, {
                    username: '1337',
                });

            before(() => expect(callAnApi.put(resource, {username: '1337'})).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 200', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(200)));
            it('and LastResponse has data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.not.be.empty));
        });

        describe('performs a put on a resource and gets 404', () => {
            const resource = '/put404';

            dummyApi
                .onPut(resource)
                .reply(404);

            before(() => expect(callAnApi.put(resource, {username: '1337'})).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 404', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(404)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.undefined));
        });

        describe('performs a patch on a resource and gets 200', () => {

            const resource = '/patch200';

            dummyApi
                .onPatch(resource, { username: '1337' })
                .reply(200);

            before(() => expect(callAnApi.patch(resource, { username: '1337' })).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 200', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(200)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.undefined));
        });

        describe('performs a patch on a resource and gets 404', () => {
            const resource = '/patch404';

            dummyApi
                .onPatch(resource, { username: '1337' })
                .reply(404);

            before(() => expect(callAnApi.put(resource, { username: '1337' })).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 404', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(404)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.undefined));
        });
    });
});
