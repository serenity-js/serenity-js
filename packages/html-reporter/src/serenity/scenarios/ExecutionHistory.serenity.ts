import type { QuestionAdapter } from '@serenity-js/core';
import { Question, Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { Attribute, By, Click, PageElement as PE, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

export interface ExecutionHistoryDotEntry {
    type: string;
    title: string;
    icon: string;
}

class ExecutionHistoryDotOutcome {
    static of = <NET>(item: PageElement<NET>): Question<Promise<ExecutionHistoryDotEntry>> => {
        const dot = PE.located(By.css('.exec-history-dot')).of(item).describedAs('dot within item');
        return Question.fromObject({
            type: Attribute.called('class').of(dot).as(classAttribute => {
                const match = classAttribute.match(/exec-history-dot--(\S+)/);
                return match ? match[1] : '';
            }),
            title: Attribute.called('title').of(item),
            icon: Text.of(dot).trim(),
        }).describedAs('execution history dot outcome');
    };
}

export class ExecutionHistory<NET> extends InteractionObject<NET> {

    private titleElement = () =>
        this.child(By.css('.card-title'))
            .describedAs('execution history title');

    private summaryElement = () =>
        this.child(By.css('.exec-history-summary'))
            .describedAs('execution history summary');

    private dots = () =>
        this.children(By.css('.exec-history-dot'))
            .describedAs('execution history dots');

    private items = () =>
        this.children(By.css('.exec-history-item'))
            .describedAs('execution history items');

    private activeItems = () =>
        this.children(By.css('.exec-history-item--active'))
            .describedAs('active execution history items');

    private dateHeaders = () =>
        this.children(By.css('.exec-history-date'))
            .describedAs('execution history date headers');

    private labelElements = () =>
        this.children(By.css('.exec-history-label'))
            .describedAs('execution history labels');

    title = (): QuestionAdapter<string> =>
        this.titleElement().text().trim()
            .describedAs('execution history title');

    summary = (): QuestionAdapter<string> =>
        this.summaryElement().text().trim()
            .describedAs('execution history summary text');

    dotCount = (): Question<Promise<number>> =>
        this.dots().count()
            .describedAs('number of execution history dots');

    activeRunCount = (): Question<Promise<number>> =>
        this.activeItems().count()
            .describedAs('number of active runs');

    dateGroupCount = (): Question<Promise<number>> =>
        this.dateHeaders().count()
            .describedAs('number of date groups');

    runLabel = (): QuestionAdapter<string> =>
        this.labelElements().first().text().trim()
            .describedAs('run label');

    dotOutcomes = (): Question<Promise<ExecutionHistoryDotEntry[]>> =>
        this.items()
            .eachMappedTo(ExecutionHistoryDotOutcome)
            .describedAs('execution history dot outcomes');

    clickRun = (index: number): Task =>
        Task.where(`#actor clicks execution history run at index ${index}`,
            Click.on(this.items().nth(index).describedAs(`execution history run #${index}`)),
        );
}
