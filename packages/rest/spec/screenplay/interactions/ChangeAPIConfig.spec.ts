import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { LogicError } from '@serenity-js/core';
import { ChangeApiConfig, GetRequest, LastResponse, Send } from '../../../src';
import { actorUsingAMockedAxiosInstance } from '../../actors';
import { expect } from '../../expect';

/** @test {ChangeApiConfig} */
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

        /**
         * @test {ChangeApiConfig}
         * @test {ChangeApiConfig.setUrlTo}
         */
        it('changes the base URL used by any subsequent requests', () => actor.attemptsTo(
            Send.a(GetRequest.to('/')),
            Ensure.that(LastResponse.status(), equals(500)),

            ChangeApiConfig.setUrlTo(newUrl),
            Send.a(GetRequest.to('/')),
            Ensure.that(LastResponse.status(), equals(200)),
        ));
    });

    describe('when changing the API port', () => {

        const { actor, mock } = actorUsingAMockedAxiosInstance({ baseURL: originalUrl });

        beforeEach(() => {
            mock.onGet(originalUrl).reply(500);
            mock.onGet(originalUrlWithNewPort).reply(200);
        });

        afterEach(() =>  mock.reset());

        /**
         * @test {ChangeApiConfig}
         * @test {ChangeApiConfig.setPortTo}
         */
        it('changes the base URL used by any subsequent requests', () => actor.attemptsTo(
            Send.a(GetRequest.to('/')),
            Ensure.that(LastResponse.status(), equals(500)),

            ChangeApiConfig.setPortTo(8080),
            Send.a(GetRequest.to('/')),
            Ensure.that(LastResponse.status(), equals(200)),
        ));

        /**
         * @test {ChangeApiConfig}
         * @test {ChangeApiConfig.setPortTo}
         */
        it('complains if the url has not been set prior to attempted port change', () => expect(actor.attemptsTo(
            ChangeApiConfig.setUrlTo(undefined),
            ChangeApiConfig.setPortTo(8080),
        )).to.be.rejectedWith(LogicError, `Can't change the port of a baseURL that has not been set.`));

        /**
         * @test {ChangeApiConfig}
         * @test {ChangeApiConfig.setPortTo}
         */
        it('complains if the url to be changed is invalid', () => expect(actor.attemptsTo(
            ChangeApiConfig.setUrlTo('invalid'),
            ChangeApiConfig.setPortTo(8080),
        )).to.be.rejectedWith(LogicError, `Could not change the API port`));
    });
});
