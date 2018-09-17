import { GetCalculationResult } from '@serenity-js-examples/calculator-app';
import { Actor, Question } from '@serenity-js/core';
import { InteractDirectly } from '../abilities';

export const ResultOfCalculation = () => Question.about(`the result of the calculation`, (actor: Actor) => {
    const ability = InteractDirectly.as(actor);

    return ability.submit(new GetCalculationResult(ability.currentCalculationId()));
});
