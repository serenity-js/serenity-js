import { not } from '@serenity-js/assertions';
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Check, Expectation, Task, the } from '@serenity-js/core';
import { By, Clear, Click, DoubleClick, Enter, Hover, Key, PageElement, Press } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject';

export const hasCssClass = Expectation.define(
    'hasCssClass', 'have css class',
    async (actual: PageElement, expectedCssClassName: string) => {
        const attributeValue = await actual.attribute('class');
        const cssClass = attributeValue ?? '';
        return cssClass
            .replace(/\s+/, ' ')
            .trim()
            .split(' ')
            .filter(Boolean)
            .includes(expectedCssClassName);
    },
);

export const isDisplayedAsCompleted = () =>
    Expectation.to<PageElement>('get displayed as completed')
        .soThatActual(hasCssClass('completed'));

export const isDisplayedAsOutstanding = () =>
    Expectation.to<PageElement>('get displayed as outstanding')
        .soThatActual(not(hasCssClass('completed')));

export class TodoItem extends InteractionObject {

    // Private elements

    private labelElement = () =>
        this.rootElement.element(By.css('label'))
            .describedAs('label');

    private toggleButton = () =>
        this.rootElement.element(By.css('input.toggle'))
            .describedAs('toggle button');

    private destroyButton = () =>
        this.rootElement.element(By.css('button.destroy'))
            .describedAs('destroy button');

    private editorField = () =>
        PageElement.located(By.css('li.editing .edit'))
            .describedAs('todo item edit box');

    // Questions

    label = (): QuestionAdapter<string> =>
        this.labelElement().text().trim()
            .describedAs('todo item label');

    isEditing = (): QuestionAdapter<boolean> =>
        PageElement.located(By.css('li.editing')).isPresent()
            .describedAs('whether an item is being edited') as QuestionAdapter<boolean>;

    // Tasks

    toggle = (): Task =>
        Task.where(the`#actor toggles the completion status of ${this.rootElement}`,
            Click.on(this.toggleButton()),
        );

    markAsCompleted = (): Task =>
        Task.where(the`#actor marks ${this.rootElement} as completed`,
            Check.whether(this.rootElement, isDisplayedAsOutstanding())
                .andIfSo(
                    this.toggle(),
                ),
        );

    markAsOutstanding = (): Task =>
        Task.where(the`#actor marks ${this.rootElement} as outstanding`,
            Check.whether(this.rootElement, isDisplayedAsCompleted())
                .andIfSo(
                    this.toggle(),
                ),
        );

    remove = (): Task =>
        Task.where(the`#actor removes ${this.rootElement}`,
            Hover.over(this.rootElement),
            Click.on(this.destroyButton()),
        );

    edit = (): Task =>
        Task.where(the`#actor starts editing ${this.rootElement}`,
            DoubleClick.on(this.labelElement()),
        );

    typeInEditor = (text: Answerable<string>): Task =>
        Task.where(the`#actor types ${text} in the editor`,
            Enter.theValue(text).into(this.editorField()),
        );

    cancelEdit = (): Task =>
        Task.where(the`#actor cancels editing`,
            Press.the(Key.Escape).in(this.editorField()),
        );

    rename = (newName: Answerable<string>): Task =>
        Task.where(the`#actor renames ${this.rootElement} to ${newName}`,
            this.edit(),
            Clear.theValueOf(this.editorField()),
            Enter.theValue(newName).into(this.editorField()),
            Press.the(Key.Enter).in(this.editorField()),
        );
}
