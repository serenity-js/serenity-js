import { Log, Task } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

const print = (message: string) =>
    Task.where(`#actor prints: ${ message }`,
        Log.the(message),
    );

const greet = (name: string) =>
    Task.where(`#actor greets the ${ name }`,
        print(`Hello ${ name }!`),
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
