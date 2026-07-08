import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import { Attribute, By, CssClasses, PageElement, PageElements, Text } from '@serenity-js/web';

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

    outcomeClasses = (): Question<Promise<string[]>> =>
        Question.about('outcome classes of history dots', async actor => {
            const dots = await actor.answer(this.dots());
            const classes: string[] = [];
            for (const dot of dots) {
                const classList = await dot.attribute('class') || '';
                const match = classList.match(/history-dot--(\S+)/);
                classes.push(match ? match[1] : '');
            }
            return classes;
        });

    titles = (): Question<Promise<string[]>> =>
        Question.about('titles of history dots', async actor => {
            const dots = await actor.answer(this.dots());
            const titles: string[] = [];
            for (const dot of dots) {
                titles.push(await dot.attribute('title') || '');
            }
            return titles;
        });
}
