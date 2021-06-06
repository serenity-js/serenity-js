import { endsWith, Ensure } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';
import { Navigate, Website } from '@serenity-js/protractor';

import { RecordItem } from './RecordItem';

export class Start {
    static withAnEmptyList = (): Task =>
        Task.where(`#actor starts with an empty list`,
            Navigate.to('http://todomvc.com/examples/angularjs/'),
            Ensure.that(Website.title(), endsWith('TodoMVC')),
        )

    static withAListContaining = (...items: string[]): Task =>
        Task.where(`#actor starts with a list containing ${ items.length } items`,
            Start.withAnEmptyList(),
            ...items.map(RecordItem.called),
        )
}
