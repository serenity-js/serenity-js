import { Ensure, equals } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';
import { Navigate, Page } from '@serenity-js/web';

import { RecordItem } from './RecordItem';

export class Start {
    static withAnEmptyList = () =>
        Task.where(`#actor starts with an empty list`,
            Navigate.to('https://todo-app.serenity-js.org/'),
            Ensure.that(Page.current().title(), equals('Serenity/JS TodoApp')),
        )

    static withAListContaining = (...items: string[]) =>
        Task.where(`#actor starts with a list containing ${ items.length } items`,
            Start.withAnEmptyList(),
            ...items.map(RecordItem.called),
        )
}
