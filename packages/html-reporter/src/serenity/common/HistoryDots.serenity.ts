import type { QuestionAdapter } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { Attribute, By, PageElements } from '@serenity-js/web';

export interface HistoryDotEntry {
    type: string;
    title: string;
}

class HistoryDotOutcome {
    static of = <NET>(dot: PageElement<NET>) =>
        Question.fromObject({
            type: Attribute.called('data-outcome').of(dot),
            title: Attribute.called('title').of(dot),
        }).describedAs('history dot outcome');
}

export class HistoryDots<NET> {

    constructor(private readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
    }

    private dots = () =>
        PageElements.located(By.css('.history-dot'))
            .of(this.rootElement)
            .describedAs('history dots');

    count = (): QuestionAdapter<number> =>
        this.dots().count()
            .describedAs('number of history dots');

    outcomes = (): Question<Promise<HistoryDotEntry[]>> =>
        this.dots()
            .eachMappedTo(HistoryDotOutcome)
            .describedAs('outcomes of history dots');
}
