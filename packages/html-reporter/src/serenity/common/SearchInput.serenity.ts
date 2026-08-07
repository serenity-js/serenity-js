import type { Answerable, Question,QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, Enter, Value } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

export class SearchInput<NET> extends InteractionObject<NET> {

    private inputField = () =>
        this.child(By.css('.search-input'))
            .describedAs('search input field');

    private clearButton = () =>
        this.child(By.css('.btn-clear'))
            .describedAs('clear search button');

    value = (): QuestionAdapter<string> =>
        Value.of(this.inputField())
            .describedAs('search input value');

    placeholder = (): QuestionAdapter<string> =>
        Attribute.called('placeholder').of(this.inputField())
            .describedAs('search input placeholder');

    label = (): QuestionAdapter<string> =>
        Attribute.called('aria-label').of(this.inputField())
            .describedAs('search input label');

    isClearable = (): Question<Promise<boolean>> =>
        this.clearButton().isPresent()
            .describedAs('whether search input is clearable');

    enter = (searchTerm: Answerable<string>): Task =>
        Task.where(the`#actor searches for ${ searchTerm }`,
            Enter.theValue(searchTerm).into(this.inputField()),
        );

    clear = (): Task =>
        Task.where(`#actor clears the search input`,
            Click.on(this.clearButton()),
        );
}
