import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, actorInTheSpotlight, engage } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { Navigate, UseAngular, Website } from '@serenity-js/protractor';
import { After, Before, Then, When } from 'cucumber';
import { Actors } from '../support/screenplay';

Before(() => {
    console.log('Cucumber :: sneario-level before')
    engage(new Actors())
});

When(/^(.*) navigates to the test website$/, (actorName: string) =>
    actorCalled(actorName).attemptsTo(
        StartLocalServer.onRandomPort(),
        UseAngular.disableSynchronisation(),
        Navigate.to(LocalServer.url()),
    ));

Then(/(?:he|she|they) should see the title of "(.*)"/, (expectedTitle: string) =>
    actorInTheSpotlight().attemptsTo(
        Ensure.that(Website.title(), equals(expectedTitle)),
    ));

After(() =>
    actorCalled('Umbra').attemptsTo(
        StopLocalServer.ifRunning(),
    ));
