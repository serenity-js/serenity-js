import { equals } from '@serenity-js/assertions';
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Question, Task } from '@serenity-js/core';
import { By, PageElement, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

class ContextItem {
    static label = () => Text.of(PageElement.located(By.css('.context-label')));
    static value = () => Text.of(PageElement.located(By.css('.context-value')));

    static of = (rootElement: PageElement) =>
        Question.fromObject({
            label: ContextItem.label().of(rootElement),
            value: ContextItem.value().of(rootElement),
        }).describedAs('context item');
}

export class SystemContextView<NET> extends InteractionObject<NET> {

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    private contextItemElements = () =>
        this.children(By.css('.context-item'))
            .describedAs('context items');

    private itemCalled = (name: string) =>
        this.contextItemElements()
            .where(ContextItem.label(), equals(name))
            .eachMappedTo(ContextItem)
            .first()
            .describedAs(`context item called ${ name }`);

    nodeVersion = (): QuestionAdapter<string> =>
        this.itemCalled('NODE.JS').value;

    testRunner = (): QuestionAdapter<string> =>
        this.itemCalled('TEST RUNNER').value;

    operatingSystem = (): QuestionAdapter<string> =>
        this.itemCalled('OPERATING SYSTEM').value;

    serenityVersion = (): QuestionAdapter<string> =>
        this.itemCalled('SERENITY/JS').value;

    ciProvider = (): QuestionAdapter<string> =>
        this.itemCalled('PROVIDER').value;

    ciBuildNumber = (): QuestionAdapter<string> =>
        this.itemCalled('BUILD').value;

    ciBranch = (): QuestionAdapter<string> =>
        this.itemCalled('BRANCH').value;

    ciCommit = (): QuestionAdapter<string> =>
        this.itemCalled('COMMIT').value;

    browser = (name: string): QuestionAdapter<string> =>
        this.itemCalled(name).value;

    open = (): Task =>
        Task.where('#actor opens the System Context view',
            this.navigation.openView('System'),
        );
}
