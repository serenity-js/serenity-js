import { Actor, Question } from '@serenity-js/core';
import { GetCalculationResult } from '@serenity-js-examples/calculator-app';

import { InteractDirectly } from '../abilities';

export const ResultOfCalculation = (): Question<Promise<number>> => Question.about<Promise<number>>(`the result of the calculation`, (actor: Actor) => {
    const ability = InteractDirectly.as(actor);

    return Promise.resolve(ability.submit(new GetCalculationResult(ability.currentCalculationId())));
});
