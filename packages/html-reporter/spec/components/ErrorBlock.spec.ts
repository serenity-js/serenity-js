import { Ensure, equals, includes } from '@serenity-js/assertions';

import { ErrorBlock } from '../../src/serenity/ErrorBlock.serenity.js';
import { describe, it } from './fixtures.js';

describe('ErrorBlock', () => {

    it('displays the error name', async ({ mount, actor }) => {
        const errorBlock = await mount({
            component: 'ErrorBlock',
            importPath: './components/ErrorBlock',
            props: {
                error: { name: 'AssertionError', message: 'expected true to be false', stack: 'at test.spec.ts:5:10' },
            },
            interactionObject: ErrorBlock,
        });

        await actor.attemptsTo(
            Ensure.that(errorBlock.name(), includes('AssertionError')),
        );
    });

    it('displays the error message with ANSI colour rendering', async ({ mount, actor }) => {
        const errorBlock = await mount({
            component: 'ErrorBlock',
            importPath: './components/ErrorBlock',
            props: {
                error: { name: 'Error', message: 'Expected value to equal 42', stack: '' },
            },
            interactionObject: ErrorBlock,
        });

        await actor.attemptsTo(
            Ensure.that(errorBlock.message(), equals('Expected value to equal 42')),
        );
    });

    it('displays the stack trace', async ({ mount, actor }) => {
        const errorBlock = await mount({
            component: 'ErrorBlock',
            importPath: './components/ErrorBlock',
            props: {
                error: { name: 'Error', message: 'fail', stack: 'at Object.<anonymous> (test.spec.ts:10:5)' },
            },
            interactionObject: ErrorBlock,
        });

        await actor.attemptsTo(
            Ensure.that(errorBlock.stackTrace(), includes('test.spec.ts:10:5')),
        );
    });

    it('shows error location when provided', async ({ mount, actor }) => {
        const errorBlock = await mount({
            component: 'ErrorBlock',
            importPath: './components/ErrorBlock',
            props: {
                error: { name: 'Error', message: 'fail', stack: '' },
                errorLocation: { path: 'src/app.ts', line: 42, column: 5 },
            },
            interactionObject: ErrorBlock,
        });

        await actor.attemptsTo(
            Ensure.that(errorBlock.name(), includes('app.ts:42')),
        );
    });
});
