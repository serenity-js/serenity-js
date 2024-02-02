import { Ensure, equals, startsWith } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';
import { LastResponse, PostRequest, Send } from '@serenity-js/rest';

export const RequestCalculationOf = (expression: string) =>
    Task.where(`#actor requests calculation of ${ expression }`,
        Send.a(
            PostRequest.to('/api/calculations').with(expression).using({ headers: { 'Content-Type': 'text/plain' }}),
        ),
        Ensure.that(LastResponse.status(), equals(201)),
        Ensure.that(LastResponse.header('location'), startsWith('/api/calculations/')),
    );
