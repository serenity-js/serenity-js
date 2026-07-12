import type { QuestionAdapter } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { Attribute, By } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

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

export class HistoryDots<NET> extends InteractionObject<NET> {

    private dots = () =>
        this.children(By.css('.history-dot'))
            .describedAs('history dots');

    count = (): QuestionAdapter<number> =>
        this.dots().count()
            .describedAs('number of history dots');

    outcomes = (): Question<Promise<HistoryDotEntry[]>> =>
        this.dots()
            .eachMappedTo(HistoryDotOutcome)
            .describedAs('outcomes of history dots');
}
