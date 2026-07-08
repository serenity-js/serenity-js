import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import { PageElement, Text } from '@serenity-js/web';

export class OutcomeBadge<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }

    iconText = (): Question<Promise<string>> =>
        Question.about('outcome badge icon text', async actor => {
            const element = await actor.answer(this.rootElement);
            return (await element.text()).trim();
        });

    outcomeClass = (): Question<Promise<string>> =>
        Question.about('outcome class of outcome badge', async actor => {
            const element = await actor.answer(this.rootElement);
            const classList = await element.attribute('class') || '';
            const classes = classList.split(/\s+/);
            const outcomeClasses = classes.filter(c => c !== 'scenario-outcome-icon' && c.length > 0);
            return outcomeClasses[0] || '';
        });
}
