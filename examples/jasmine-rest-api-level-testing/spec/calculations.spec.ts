import 'jasmine';

import { equals } from '@serenity-js/assertions';
import { actorCalled, engage, Note, TakeNote } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { ChangeApiUrl, LastResponse } from '@serenity-js/rest';

import { Actors, RequestCalculationOf, VerifyResultAt } from './screenplay';

describe('Calculator', () => {

    beforeAll(() => engage(new Actors()));

    // start the server once and keep it running for all the tests
    beforeAll(() =>
        actorCalled('Apisitt').attemptsTo(
            StartLocalServer.onRandomPort(),

            // Apisitt uses a shared notepad, so other actors can read his notes
            TakeNote.of(LocalServer.url()),
        ));

    // shut the server down when all tests are finished
    afterAll(() =>
        actorCalled('Apisitt').attemptsTo(
            StopLocalServer.ifRunning(),
        ));

    it('calculates result of basic expressions', () =>
        actorCalled('Jane').attemptsTo(
            // Jane and Apisitt use a shared notepad
            ChangeApiUrl.to(Note.of(LocalServer.url())),
            RequestCalculationOf('5 + 2'),
            VerifyResultAt(LastResponse.header('location'), equals({ result: 7 })),
        ));

    it('recognises order of operations', () =>
        actorCalled('Jane').attemptsTo(
            ChangeApiUrl.to(Note.of(LocalServer.url())),
            RequestCalculationOf('2 + 2 * 2'),
            VerifyResultAt(LastResponse.header('location'), equals({ result: 6 })),
        ));
});
