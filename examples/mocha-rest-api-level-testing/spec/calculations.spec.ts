import 'mocha';

import { equals } from '@serenity-js/assertions';
import { actorCalled, engage, Note, TakeNote } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { ChangeApiUrl, LastResponse } from '@serenity-js/rest';
import { Actors } from './screenplay';
import { RequestCalculationOf, VerifyResultAt } from './screenplay/tasks';

describe('Calculator', () => {

    before(() => engage(new Actors()));

    beforeEach(() =>
        actorCalled('Apisitt').attemptsTo(
            StartLocalServer.onRandomPort(),
            TakeNote.of(LocalServer.url()),
        ));

    afterEach(() =>
        actorCalled('Apisitt').attemptsTo(
            StopLocalServer.ifRunning(),
        ));

    it('calculates result of basic expressions', () =>
        actorCalled('Jane').attemptsTo(
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
