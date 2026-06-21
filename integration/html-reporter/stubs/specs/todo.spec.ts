import { Ensure, equals, not } from '@serenity-js/assertions';
import { Task, the } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';
import { Navigate, Page } from '@serenity-js/web';

describe('Todo List', () => {

    describe('Display', () => {

        it('should display items', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Ensure.that(Page.current().title(), not(equals(''))),
            );
        });

        it('should add a new item', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Ensure.that(Page.current().title(), not(equals(''))),
            );
        });

        it('should filter items', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Ensure.that(Page.current().title(), not(equals(''))),
            );
        });
    });

    describe('Completion', () => {

        it('should complete an item', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Ensure.that(Page.current().title(), equals('This will fail')),
            );
        });
    });

    describe('Persistence', () => {

        it('should persist items', async ({ actor }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Ensure.that(Page.current().title(), not(equals(''))),
            );
        });

        it('should sync across tabs', async ({ actor }) => {
            await actor.attemptsTo(
                Task.where(the`#actor has a pending step`),
            );
        });
    });

    describe('Editing', () => {

        describe.configure({ retries: 1 });

        it('should edit an item', async ({ actor }, testInfo) => {
            await actor.attemptsTo(
                Navigate.to('/index.html'),
                Ensure.that(Page.current().title(), equals(testInfo.retry === 0 ? 'Will fail first time' : 'Stub App')),
            );
        });
    });
});
