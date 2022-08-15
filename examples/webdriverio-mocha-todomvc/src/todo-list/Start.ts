import { endsWith, Ensure } from '@serenity-js/assertions';
import { Answerable, Task } from '@serenity-js/core';
import { Navigate, Page } from '@serenity-js/web';

import { RecordItem } from './RecordItem';

export class Start {
    static withAnEmptyList = () =>
        Task.where(`#actor starts with an empty list`,
            Navigate.to('/'),
            // Ensure.that(Website.title(), endsWith('Serenity/JS TodoApp')),
            Ensure.that(Page.current().title(), endsWith('Serenity/JS TodoApp')),
        )

    static withAListContaining = (...items: Array<Answerable<string>>) =>
        Task.where(`#actor starts with a list containing ${ items.length } items`,
            Start.withAnEmptyList(),
            ...items.map(RecordItem.called),
        )
}
