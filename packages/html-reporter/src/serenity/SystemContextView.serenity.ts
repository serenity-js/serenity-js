import type { Answerable } from '@serenity-js/core';
import { Question, Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, PageElements } from '@serenity-js/web';

import { Navigation } from './Navigation.serenity.js';

export class SystemContextView<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
    }

    private allContextValues = () =>
        PageElements.located(By.css('.context-value'))
            .of(this.rootElement)
            .describedAs('context values');

    nodeVersion = (): Question<Promise<string>> =>
        Question.about('Node.js version', async actor => {
            const values = await actor.answer(this.allContextValues());
            if (values.length > 0) {
                return (await values[0].text()).trim();
            }
            return '';
        });

    testRunner = (): Question<Promise<string>> =>
        Question.about('test runner', async actor => {
            const values = await actor.answer(this.allContextValues());
            if (values.length > 1) {
                return (await values[1].text()).trim();
            }
            return '';
        });

    operatingSystem = (): Question<Promise<string>> =>
        Question.about('operating system', async actor => {
            const values = await actor.answer(this.allContextValues());
            if (values.length > 2) {
                return (await values[2].text()).trim();
            }
            return '';
        });

    serenityVersion = (): Question<Promise<string>> =>
        Question.about('Serenity/JS version', async actor => {
            const values = await actor.answer(this.allContextValues());
            if (values.length > 3) {
                return (await values[3].text()).trim();
            }
            return '';
        });

    open = (): Task =>
        Task.where('#actor opens the System Context view',
            this.navigation.openView('System'),
        );
}
