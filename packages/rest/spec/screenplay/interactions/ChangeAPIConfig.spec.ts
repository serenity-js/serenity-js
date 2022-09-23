import { Ensure, equals } from '@serenity-js/assertions';
import { LogicError } from '@serenity-js/core';
import { afterEach, beforeEach, describe, it } from 'mocha';

import { ChangeApiConfig, GetRequest, LastResponse, Send } from '../../../src';
import { actorUsingAMockedAxiosInstance } from '../../actors';
import { expect } from '../../expect';

describe('ChangeApiConfig', () => {

    const
        originalUrl             = 'http://localhost/',
        newUrl                  = 'http://example.com/',
        originalUrlWithNewPort  = 'http://localhost:8080/';

    describe('when changing the API URL', () => {

        const { actor, mock } = actorUsingAMockedAxiosInstance({ baseURL: originalUrl });

        beforeEach(() => {
            mock.onGet(originalUrl).reply(500);
            mock.onGet(newUrl).reply(200);
        });

        afterEach(() =>  mock.reset());

        it('changes the base URL used by any subsequent requests', () => actor.attemptsTo(
            Send.a(GetRequest.to('/')),
            Ensure.that(LastResponse.status(), equals(500)),

            ChangeApiConfig.setUrlTo(newUrl),
            Send.a(GetRequest.to('/')),
            Ensure.that(LastResponse.status(), equals(200)),
        ));

        it('correctly detects its invocation location', () => {
            const activity = ChangeApiConfig.setUrlTo(newUrl);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('ChangeAPIConfig.spec.ts');
            expect(location.line).to.equal(37);
            expect(location.column).to.equal(46);
        });
    });

    describe('when changing the API port', () => {

        const { actor, mock } = actorUsingAMockedAxiosInstance({ baseURL: originalUrl });

        beforeEach(() => {
            mock.onGet(originalUrl).reply(500);
            mock.onGet(originalUrlWithNewPort).reply(200);
        });

        afterEach(() =>  mock.reset());

        it('changes the base URL used by any subsequent requests', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to('/')),
                Ensure.that(LastResponse.status(), equals(500)),

                ChangeApiConfig.setPortTo(8080),
                Send.a(GetRequest.to('/')),
                Ensure.that(LastResponse.status(), equals(200)),
            ));

        it('complains if the url has not been set prior to attempted port change', () =>
            expect(actor.attemptsTo(
                ChangeApiConfig.setUrlTo(undefined),    // eslint-disable-line unicorn/no-useless-undefined
                ChangeApiConfig.setPortTo(8080),
            )).to.be.rejectedWith(LogicError, `Can't change the port of a baseURL that has not been set.`));

        it('complains if the url to be changed is invalid', () =>
            expect(actor.attemptsTo(
                ChangeApiConfig.setUrlTo('invalid'),
                ChangeApiConfig.setPortTo(8080),
            )).to.be.rejectedWith(LogicError, `Could not change the API port`));

        it('correctly detects its invocation location', () => {
            const activity = ChangeApiConfig.setPortTo(8080);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('ChangeAPIConfig.spec.ts');
            expect(location.line).to.equal(80);
            expect(location.column).to.equal(46);
        });
    });

    describe('when setting a request header', () => {

        const { actor, mock } = actorUsingAMockedAxiosInstance({ baseURL: originalUrl });

        beforeEach(() => {
            const dataMatcher = undefined;
            mock.onGet(originalUrl, dataMatcher).replyOnce(401);
            mock.onGet(originalUrl, dataMatcher, {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': 'my-token'
            }).replyOnce(200);
        });

        afterEach(() =>  mock.reset());

        it('sets a header to be used by any subsequent requests', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to('/')),
                Ensure.that(LastResponse.status(), equals(401)),

                ChangeApiConfig.setHeader('Authorization', 'my-token'),
                Send.a(GetRequest.to('/')),
                Ensure.that(LastResponse.status(), equals(200)),
            ));

        it('complains if the name of the header is empty', () =>
            expect(actor.attemptsTo(
                ChangeApiConfig.setHeader('', 'value'),
            )).to.be.rejectedWith(LogicError, `Looks like the name of the header is missing, "" given`));

        it('complains if the name of the header is undefined', () =>
            expect(actor.attemptsTo(
                ChangeApiConfig.setHeader(undefined, 'value'),
            )).to.be.rejectedWith(LogicError, `Looks like the name of the header is missing, "undefined" given`));

        it('correctly detects its invocation location', () => {
            const activity = ChangeApiConfig.setHeader(undefined, 'value');
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('ChangeAPIConfig.spec.ts');
            expect(location.line).to.equal(125);
            expect(location.column).to.equal(46);
        });
    });
});
