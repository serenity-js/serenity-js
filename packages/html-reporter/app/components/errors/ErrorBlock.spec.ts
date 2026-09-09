import { Ensure, equals, includes } from '@serenity-js/assertions';

import { describe, it } from '@serenity-js/playwright-test';
import { ErrorBlock } from '../../../src/serenity/errors/ErrorBlock.serenity.js';

describe('ErrorBlock', () => {

    it('displays the error name', async ({ story, actor }) => {
        const errorBlock = story('components/errors/ErrorBlock/Default', {
            error: { name: 'AssertionError', message: 'expected true to be false', stack: 'at test.spec.ts:5:10' },
        }).as(ErrorBlock);

        await actor.attemptsTo(
            Ensure.that(errorBlock.name(), includes('AssertionError')),
        );
    });

    it('displays the error message with ANSI colour rendering', async ({ story, actor }) => {
        const errorBlock = story('components/errors/ErrorBlock/Default', {
            error: { name: 'Error', message: 'Expected value to equal 42', stack: '' },
        }).as(ErrorBlock);

        await actor.attemptsTo(
            Ensure.that(errorBlock.message(), equals('Expected value to equal 42')),
        );
    });

    it('displays the stack trace', async ({ story, actor }) => {
        const errorBlock = story('components/errors/ErrorBlock/Default', {
            error: { name: 'Error', message: 'fail', stack: 'at Object.<anonymous> (test.spec.ts:10:5)' },
        }).as(ErrorBlock);

        await actor.attemptsTo(
            Ensure.that(errorBlock.stackTrace(), includes('test.spec.ts:10:5')),
        );
    });

    it('shows error location when provided', async ({ story, actor }) => {
        const errorBlock = story('components/errors/ErrorBlock/Default', {
            error: { name: 'Error', message: 'fail', stack: '' },
            errorLocation: { path: 'src/app.ts', line: 42, column: 5 },
        }).as(ErrorBlock);

        await actor.attemptsTo(
            Ensure.that(errorBlock.name(), includes('app.ts:42')),
        );
    });
});
