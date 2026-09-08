import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, Enter, PageElement, PageElementAdapter, Text, Value } from '@serenity-js/web';

export class UppercaseInput<NET> {

    private readonly rootElement: PageElementAdapter<NET>;

    constructor(rootElement: Answerable<PageElement<NET>>) {
        this.rootElement = PageElement.createAdapter(rootElement);
    }

    inputValue = (): QuestionAdapter<string> =>
        Value.of(this.rootElement.element(By.css('input')).describedAs('text input'))
            .describedAs('input value');

    outputText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement.element(By.css('.output')).describedAs('uppercase output'))
            .describedAs('uppercase output text');

    enterText = (text: Answerable<string>): Task =>
        Task.where(the`#actor enters ${ text } into the uppercase input`,
            Enter.theValue(text).into(
                this.rootElement.element(By.css('input')).describedAs('text input'),
            ),
        );
}
