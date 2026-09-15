import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, Enter, PageElement, PageElementAdapter, Text, Value } from '@serenity-js/web';

export class UppercaseInput<NET> {

    private readonly rootElement: PageElementAdapter<NET>;
    private readonly inputField: PageElementAdapter<NET>;
    private readonly output: PageElementAdapter<NET>;

    constructor(rootElement: Answerable<PageElement<NET>>) {
        this.rootElement = PageElement.createAdapter(rootElement);
        this.inputField = this.rootElement.element(By.css('input')).describedAs('text input');
        this.output = this.rootElement.element(By.css('.output')).describedAs('uppercase output')
    }

    inputValue = (): QuestionAdapter<string> =>
        Value.of(this.inputField)
            .describedAs('input value');

    outputText = (): QuestionAdapter<string> =>
        Text.of(this.output);

    enterText = (text: Answerable<string>): Task =>
        Task.where(the`#actor enters ${ text } into the uppercase input`,
            Enter.theValue(text).into(this.inputField),
        );
}
