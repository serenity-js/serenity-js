import { Ensure, equals } from '@serenity-js/assertions';
import { Answerable, q, Task } from '@serenity-js/core';
import { DeleteRequest, LastResponse, PostRequest, Send } from '@serenity-js/rest';
import { Navigate } from '../../src';
import { LocalServer } from '@serenity-js/local-server';

export const CreatePage = (name: Answerable<string>, body: Answerable<string>): Task =>
    Task.where(`#actor creates page called ${ name }`,
        Send.a(PostRequest.to(q`/pages/${ name }`).with(body).using({
            headers: { 'Content-Type': 'text/plain' },
        })),
        Ensure.that(LastResponse.status(), equals(201))
    );

export const VisitPage = (name: Answerable<string>): Task =>
    Task.where(`#actor visits page called ${ name }`,
        Navigate.to(q`${ LocalServer.url() }/pages/${ name }`),
    );

export const DeletePage = (name: Answerable<string>): Task =>
    Task.where(`#actor deletes page called ${ name }`,
        Send.a(DeleteRequest.to(q`/pages/${ name }`)),
        Ensure.that(LastResponse.status(), equals(200))
    );
