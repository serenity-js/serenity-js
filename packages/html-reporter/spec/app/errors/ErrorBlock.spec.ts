import { Ensure, equals, includes } from '@serenity-js/assertions';

import { ErrorBlock } from '../../../src/serenity/errors/ErrorBlock.serenity.js';
import { describe, it } from '../fixtures.js';

describe('ErrorBlock', () => {

    it('displays the error name', async ({ interactionObject, actor }) => {
        const errorBlock = await interactionObject(ErrorBlock, './components/errors/ErrorBlock', {
            props: {
                error: { name: 'AssertionError', message: 'expected true to be false', stack: 'at test.spec.ts:5:10' },
            },
        });

        await actor.attemptsTo(
            Ensure.that(errorBlock.name(), includes('AssertionError')),
        );
    });

    it('displays the error message with ANSI colour rendering', async ({ interactionObject, actor }) => {
        const errorBlock = await interactionObject(ErrorBlock, './components/errors/ErrorBlock', {
            props: {
                error: { name: 'Error', message: 'Expected value to equal 42', stack: '' },
            },
        });

        await actor.attemptsTo(
            Ensure.that(errorBlock.message(), equals('Expected value to equal 42')),
        );
    });

    it('displays the stack trace', async ({ interactionObject, actor }) => {
        const errorBlock = await interactionObject(ErrorBlock, './components/errors/ErrorBlock', {
            props: {
                error: { name: 'Error', message: 'fail', stack: 'at Object.<anonymous> (test.spec.ts:10:5)' },
            },
        });

        await actor.attemptsTo(
            Ensure.that(errorBlock.stackTrace(), includes('test.spec.ts:10:5')),
        );
    });

    it('shows error location when provided', async ({ interactionObject, actor }) => {
        const errorBlock = await interactionObject(ErrorBlock, './components/errors/ErrorBlock', {
            props: {
                error: { name: 'Error', message: 'fail', stack: '' },
                errorLocation: { path: 'src/app.ts', line: 42, column: 5 },
            },
        });

        await actor.attemptsTo(
            Ensure.that(errorBlock.name(), includes('app.ts:42')),
        );
    });
});
