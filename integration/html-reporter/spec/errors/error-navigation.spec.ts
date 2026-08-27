import { Ensure, isPresent } from '@serenity-js/assertions';
import { Wait } from '@serenity-js/core';
import { Navigate } from '@serenity-js/web';

import { describe, it } from '../../src';
import { failingTest } from '../../src/scenarios';

describe('Errors', () => {

    describe('Error Navigation', () => {

        it('finds scenarios when search contains a quoted phrase', { tag: '@showcase' }, async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                // A quoted search term — simulates clicking an error group in the Errors view
                Navigate.to('/single/index.html#/tests?search=%22Payment%20rejected%22'),

                Wait.until(scenariosView, isPresent()),

                Ensure.that(scenariosView.scenarioCalled(failingTest), isPresent()),
            );
        });

        it('finds scenarios when search contains escaped double quotes', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                // A search term with escaped quotes inside: "equal \"Payment rejected\""
                // This simulates what ErrorRow produces when the error message contains quotes
                Navigate.to('/single/index.html#/tests?search=%22equal%20%5C%22Payment%20rejected%5C%22%22'),

                Wait.until(scenariosView, isPresent()),

                Ensure.that(scenariosView.scenarioCalled(failingTest), isPresent()),
            );
        });
    });
});
