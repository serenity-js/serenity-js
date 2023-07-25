import { Log, Task } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

const greet = (name: string) =>
    Task.where(`#actor greets the ${ name }`,
        Log.the(`Hello ${ name }!`),
    );

describe('Playwright Test reporting', () => {

    describe('A screenplay scenario', () => {
        it('reports tasks as Playwright steps', async ({ actorCalled }) => {
            await actorCalled('Alice').attemptsTo(
                greet('World'),
            );
        });
    });
});
