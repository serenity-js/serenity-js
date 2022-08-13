import { After, Before, Then, When } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, actorInTheSpotlight, engage, q } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { UseAngular } from '@serenity-js/protractor';
import { Navigate, Page } from '@serenity-js/web';

import { Actors } from '../support/screenplay';

Before(() => {
    engage(new Actors())
});

When(/^(.*) navigates to the test website$/, (actorName: string) =>
    actorCalled(actorName).attemptsTo(
        StartLocalServer.onRandomPort(),
        UseAngular.disableSynchronisation(),
        Navigate.to(LocalServer.url()),
    ));

When(/^(.*) navigates to the test website number (.*?)$/, (actorName: string, id: string) =>
    actorCalled(actorName).attemptsTo(
        StartLocalServer.onRandomPort(),
        UseAngular.disableSynchronisation(),
        Navigate.to(q`${ LocalServer.url() }/${ id }`),
    ));

Then(/(?:he|she|they) should see the title of "(.*)"/, (expectedTitle: string) =>
    actorInTheSpotlight().attemptsTo(
        Ensure.that(Page.current().title(), equals(expectedTitle)),
    ));

After(() =>
    actorCalled('Umbra').attemptsTo(
        StopLocalServer.ifRunning(),
    ));
