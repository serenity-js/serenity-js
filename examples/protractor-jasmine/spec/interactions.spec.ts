import { Ensure, equals } from '@serenity-js/assertions';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { Navigate, UseAngular, Website } from '@serenity-js/protractor';

describe('Interaction flow', () => {

    it('enables the actor to interact with the website', function () {
        return this.stage.theActorCalled('Jasmine').attemptsTo(
            StartLocalServer.onRandomPort(),
            UseAngular.disableSynchronisation(),
            Navigate.to(LocalServer.url()),
            Ensure.that(Website.title(), equals('Test Website')),
        );
    });

    afterEach(function () {
        return this.stage.theActorInTheSpotlight().attemptsTo(
            StopLocalServer.ifRunning(),
        );
    });
});
