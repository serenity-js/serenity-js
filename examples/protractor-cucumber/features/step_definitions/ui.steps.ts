import { Ensure, equals } from '@serenity-js/assertions';
import { WithStage } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { Navigate, UseAngular, Website } from '@serenity-js/protractor';
import { After, Then, When } from 'cucumber';

When(/^(.*) navigates to the test website$/, function(this: WithStage, actorName: string) {
    return this.stage.actor(actorName).attemptsTo(
        StartLocalServer.onRandomPort(),
        UseAngular.disableSynchronisation(),
        Navigate.to(LocalServer.url()),
    );
});

Then(/(?:he|she|they) should see the title of "(.*)"/, function(this: WithStage, expectedTitle: string) {
    return this.stage.theActorInTheSpotlight().attemptsTo(
        Ensure.that(Website.title(), equals(expectedTitle)),
    );
});

After(function () {
    return this.stage.theActorCalled('Umbra').attemptsTo(
        StopLocalServer.ifRunning(),
    );
});
