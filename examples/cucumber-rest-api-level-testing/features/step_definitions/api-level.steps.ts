import { equals } from '@serenity-js/assertions';
import { WithStage } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { ChangeApiUrl, LastResponse } from '@serenity-js/rest';
import { After, Before, Then, When } from 'cucumber';
import { RequestCalculationOf, VerifyResultAt } from '../support/screenplay';

Before(function () {
    return this.stage.theActorCalled('Apisitt').attemptsTo(                     // todo: change to Maggie
        StartLocalServer.onRandomPort(),
        ChangeApiUrl.to(LocalServer.url()),
        // TakeNote.of(LocalServer.url())               // Question or Question<Promise>; Pass between actors
    );
});

When(/^(.*) asks for the following calculation: (.*)$/, function (this: WithStage, actorName: string, expression: string) {
    return this.stage.actor(actorName).attemptsTo(
        RequestCalculationOf(expression),
    );
});

Then(/(?:he|she|they) should get a result of ([\d-.]+)/, function (this: WithStage, expectedResult: string) {
    return this.stage.theActorInTheSpotlight().attemptsTo(
        VerifyResultAt(LastResponse.header('location'), equals({ result: Number(expectedResult) })),
    );
});

After(function () {
    return this.stage.theActorCalled('Apisitt').attemptsTo(
        StopLocalServer.ifRunning(),
    );
});
