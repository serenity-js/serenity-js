import { After, Before, Then, When } from '@cucumber/cucumber';
import { equals } from '@serenity-js/assertions';
import { actorCalled, actorInTheSpotlight } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { ChangeApiConfig, LastResponse } from '@serenity-js/rest';

import { RequestCalculationOf, VerifyResultAt } from '../support/screenplay';

Before(() =>
    actorCalled('Apisitt').attemptsTo(
        StartLocalServer.onRandomPort(),
        ChangeApiConfig.setUrlTo(LocalServer.url()),
    ));

When(/^(.*) asks for the following calculation: (.*)$/, (actorName: string, expression: string) =>
    actorCalled(actorName).attemptsTo(
        RequestCalculationOf(expression),
    ));

Then(/(?:he|she|they) should get a result of ([\d-.]+)/, (expectedResult: string) =>
    actorInTheSpotlight().attemptsTo(
        VerifyResultAt(LastResponse.header('location'), equals({ result: Number(expectedResult) })),
    ));

After(() =>
    actorCalled('Apisitt').attemptsTo(
        StopLocalServer.ifRunning(),
    ));
