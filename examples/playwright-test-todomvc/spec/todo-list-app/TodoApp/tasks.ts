import { Ensure, equals } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';
import { Answerable } from '@serenity-js/core';
import { HeadRequest, LastResponse,Send } from '@serenity-js/rest';
import { Navigate, Page } from '@serenity-js/web';

import { recordItem } from '../TodoItem/tasks';

export const startWithAnEmptyList = () =>
    Task.where(`#actor starts with an empty todo list`,

        Send.a(HeadRequest.to('/')),
        Ensure.that(LastResponse.status(), equals(200)),

        Navigate.to('/'),
        Ensure.that(
            Page.current().title().describedAs('website title'),
            equals('Serenity/JS TodoApp'),
        ),
    );

export const startWithAListContaining = (...items: Array<Answerable<string>>) =>
    Task.where(`#actor starts with a list containing ${ items.length } items`,
        startWithAnEmptyList(),
        ...items.map(recordItem),
    );
