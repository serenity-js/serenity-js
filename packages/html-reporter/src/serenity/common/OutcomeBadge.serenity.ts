import type { Answerable } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';

export class OutcomeBadge<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }

    iconText = (): Question<Promise<string>> =>
        Question.about('outcome badge icon text', async actor => {
            const element = await actor.answer(this.rootElement);
            return (await element.text()).trim();
        });

    outcomeType = (): Question<Promise<string>> =>
        Question.about('outcome type of outcome badge', async actor => {
            const element = await actor.answer(this.rootElement);
            const classList = await element.attribute('class') || '';
            const classes = classList.split(/\s+/);
            const outcomeClasses = classes.filter(c => c !== 'scenario-outcome-icon' && c.length > 0);
            return outcomeClasses[0] || '';
        });
}
