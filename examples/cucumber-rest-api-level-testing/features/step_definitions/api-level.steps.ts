import { equals } from '@serenity-js/assertions';
import { WithStage } from '@serenity-js/cucumber';
import { LastResponse } from '@serenity-js/rest';
import { Then, When } from 'cucumber';
import { RequestCalculationOf, VerifyResultAt } from '../support/screenplay';

When(/^(.*) asks for the following calculation: (.*)$/, function(this: WithStage, actorName: string, expression: string) {
    return this.stage.actor(actorName).attemptsTo(
        RequestCalculationOf(expression),
    );
});

Then(/(?:he|she|they) should get a result of ([\d-.]+)/, function(this: WithStage, expectedResult: string) {
    return this.stage.theActorInTheSpotlight().attemptsTo(
        VerifyResultAt(LastResponse.header('location'), equals({ result: Number(expectedResult) })),
    );
});
