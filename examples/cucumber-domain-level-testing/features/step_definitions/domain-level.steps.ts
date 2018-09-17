import { Operand, Operator } from '@serenity-js-examples/calculator-app';
import { See } from '@serenity-js/core';
import { WithStage } from '@serenity-js/cucumber';

import { expect } from 'chai';
import { Then, When } from 'cucumber';
import { EnterOperand, ResultOfCalculation, UseOperator } from '../support/screenplay';

When(/^(.*) enters (\d+)$/, function(this: WithStage, actorName: string, operandValue: string) {
    const actor = ! isPronoun(actorName) ? this.stage.actor(actorName) : this.stage.currentActor();

    return actor.attemptsTo(
        EnterOperand(new Operand(parseFloat(operandValue))),
    );
});

When(/(?:he|she|they) uses? the (.) operator/, function(this: WithStage, operatorSymbol: string) {
    return this.stage.currentActor().attemptsTo(
        UseOperator(Operator.from(operatorSymbol)),
    );
});

Then(/(?:he|she|they) should get a result of (\d+)/, function(this: WithStage, expectedResult: string) {
    return this.stage.currentActor().attemptsTo(
        // todo: use @serenity-js/assertions instead
        See.if(ResultOfCalculation(), value => expect(value).to.equal(parseFloat(expectedResult))),
    );
});

function isPronoun(actorName: string) {
    return !!~ ['he', 'she', 'they'].indexOf(actorName);
}
