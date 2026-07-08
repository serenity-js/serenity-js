import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import { By, PageElement, PageElements } from '@serenity-js/web';

export interface HistoryDotEntry {
    type: string;
    title: string;
}

export class HistoryDots<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }

    private dots = () =>
        PageElements.located(By.css('.history-dot'))
            .of(this.rootElement)
            .describedAs('history dots');

    count = (): QuestionAdapter<number> =>
        this.dots().count()
            .describedAs('number of history dots');

    outcomes = (): Question<Promise<HistoryDotEntry[]>> =>
        Question.about('outcomes of history dots', async actor => {
            const dots = await actor.answer(this.dots());
            const entries: HistoryDotEntry[] = [];
            for (const dot of dots) {
                const classList = await dot.attribute('class') || '';
                const match = classList.match(/history-dot--(\S+)/);
                const type = match ? match[1] : '';
                const title = await dot.attribute('title') || '';
                entries.push({ type, title });
            }
            return entries;
        });
}
