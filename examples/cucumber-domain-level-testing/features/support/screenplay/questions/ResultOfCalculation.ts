import { GetCalculationResult } from '@examples/calculator-app';
import { Actor, Question } from '@serenity-js/core';

import { InteractDirectly } from '../abilities';

export const ResultOfCalculation = () => Question.about<Promise<number>>(`the result of the calculation`, (actor: Actor) => {
    const ability = InteractDirectly.as(actor);

    return Promise.resolve(ability.submit(new GetCalculationResult(ability.currentCalculationId())));
});
