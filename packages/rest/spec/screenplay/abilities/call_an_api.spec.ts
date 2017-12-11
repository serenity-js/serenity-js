import nock = require('nock');
import 'mocha';
import {CallAnApi} from '../../../src/screenplay/abilities';

import {expect} from '../../expect';

describe('Abilities', () => {

    const baseUrl = 'https://dum.my';

    describe('Call an Api at baseUrl', () => {
        const callAnApi = CallAnApi.at(baseUrl);

        describe('performs a get on a resource and get 200', () => {

            const resource = '/get200';
            const dummyRest = nock(baseUrl)
                .get(resource)
                .reply(200, {
                    username: '1337',
                });

            before(() => expect(callAnApi.get(resource)).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 200', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(200)));
            it('and LastResponse has data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.not.be.empty));
        });

        describe('performs a get on a resource and get 404', () => {
            const resource = '/get404';
            const dummyRest = nock(baseUrl)
                .get(resource)
                .reply(404);

            before(() => expect(callAnApi.get(resource)).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 404', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(404)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.empty));

        });

        describe('performs a post on a resource and get 201', () => {
            const resource = '/post201';
            const dummyRest = nock(baseUrl)
                .post(resource)
                .reply(201, {
                    username: '1337',
                });

            before(() => expect(callAnApi.post(resource, {username: '1337'})).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 404', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(201)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.not.be.empty));

        });

        describe('performs a post on a resource and get 403', () => {
            const resource = '/post403';
            const dummyRest = nock(baseUrl)
                .post(resource)
                .reply(403);

            before(() => expect(callAnApi.post(resource, {username: '1337'})).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 404', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(403)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.empty));

        });

        describe('performs a delete on a resource and get 200', () => {

            const resource = '/delete200';
            const dummyRest = nock(baseUrl)
                .delete(resource)
                .reply(200, {
                    username: '1337',
                });

            before(() => expect(callAnApi.delete(resource)).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 200', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(200)));
            it('and LastResponse has data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.not.be.empty));
        });

        describe('performs a delete on a resource and get 404', () => {
            const resource = '/delete404';
            const dummyRest = nock(baseUrl)
                .delete(resource)
                .reply(404);

            before(() => expect(callAnApi.delete(resource)).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 404', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(404)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.empty));

        });

        describe('performs a put on a resource and get 200', () => {

            const resource = '/put200';
            const dummyRest = nock(baseUrl)
                .put(resource)
                .reply(200, {
                    username: '1337',
                });

            before(() => expect(callAnApi.put(resource, {username: '1337'})).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 200', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(200)));
            it('and LastResponse has data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.not.be.empty));
        });

        describe('performs a put on a resource and get 404', () => {
            const resource = '/404';
            const dummyRest = nock(baseUrl)
                .put(resource)
                .reply(404);

            before(() => expect(callAnApi.put(resource, {username: '1337'})).to.eventually.be.fulfilled);

            it('and eventually has a LastResponse', () => expect(callAnApi.getLastResponse()).to.eventually.not.be.undefined);
            it('and LastResponse status is 404', () => callAnApi.getLastResponse().then(response => expect(response.status).to.equal(404)));
            it('and LastResponse has no data', () => callAnApi.getLastResponse().then(response => expect(response.data).to.be.empty));

        });

    });
});
