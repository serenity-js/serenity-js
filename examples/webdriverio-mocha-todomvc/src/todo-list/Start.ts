import { endsWith, Ensure } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';
import { Navigate, Website } from '@serenity-js/webdriverio';
import { RecordItem } from './RecordItem';

export class Start {
    static withAnEmptyList = () =>
        Task.where(`#actor starts with an empty list`,
            Navigate.to('/'),
            Ensure.that(Website.title(), endsWith('Serenity/JS TodoApp')),
        )

    static withAListContaining = (...items: string[]) =>
        Task.where(`#actor starts with a list containing ${ items.length } items`,
            Start.withAnEmptyList(),
            ...items.map(RecordItem.called),
        )
}
