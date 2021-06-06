import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, actorInTheSpotlight, engage } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { Navigate, UseAngular, Website } from '@serenity-js/protractor';

import { Actors } from './support/Actors';

describe('Interaction flow', () => {

    beforeEach(() => engage(new Actors()));

    it('enables the actor to interact with the website', function () {
        return actorCalled('Jasmine').attemptsTo(
            StartLocalServer.onRandomPort(),
            UseAngular.disableSynchronisation(),
            Navigate.to(LocalServer.url()),
            Ensure.that(Website.title(), equals('Test Website')),
        );
    });

    afterEach(() => actorInTheSpotlight().attemptsTo(
        StopLocalServer.ifRunning(),
    ));
});
