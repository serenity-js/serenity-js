import { contain, Ensure } from '@serenity-js/assertions';
import { Answerable, Check, d, Task, Wait } from '@serenity-js/core';
import { Clear, Click, DoubleClick, Enter, Hover, Key, PageElement, Press } from '@serenity-js/web';

import { newTodoInput } from '../TodoApp';
import { itemNames } from '../TodoList';
import { isDisplayedAsCompleted, isDisplayedAsOutstanding } from './expectations';
import { destroyButton, editor, label, toggleButton } from './questions';

export const recordItem = (name: Answerable<string>): Task =>
    Task.where(d `#actor records an item called ${ name }`,
        Enter.theValue(name).into(newTodoInput()),
        Press.the(Key.Enter).in(newTodoInput()),
        Wait.until(itemNames(), contain(name)),
    )

export const remove = (item: Answerable<PageElement>): Task =>
    Task.where(d `#actor removes ${ item }`,
        Hover.over(item),
        Click.on(destroyButton().of(item)),
    )

export const edit = (item: Answerable<PageElement>): Task =>
    Task.where(d `#actor edits ${ item }`,
        DoubleClick.on(label().of(item)),
        Clear.theValueOf(editor()),
    )

export const rename = (item: Answerable<PageElement>) => ({
    to: (newName: Answerable<string>) =>
        Task.where(d `#actor renames ${ item } to ${ newName }`,
            edit(item),
            Enter.theValue(newName).into(editor()),
            Press.the(Key.Enter).in(editor()),
        ),
})

export const markAsCompleted = (item: Answerable<PageElement>): Task =>
    Task.where(d `#actor marks ${ item } as completed`,
        Check.whether(item, isDisplayedAsOutstanding())
            .andIfSo(
                toggle(item),
                Ensure.that(item, isDisplayedAsCompleted()),
            ),
    )

export const markAsOutstanding = (item: Answerable<PageElement>): Task =>
    Task.where(d `#actor marks ${ item } as outstanding`,
        Check.whether(item, isDisplayedAsCompleted())
            .andIfSo(
                toggle(item),
                Ensure.that(item, isDisplayedAsOutstanding()),
            ),
    )

export const toggle = (item: Answerable<PageElement>): Task =>
    Task.where(d `#actor toggles the completion status of ${ item }`,
        Click.on(
            toggleButton().of(item),
        ),
    )
