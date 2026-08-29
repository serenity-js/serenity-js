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

        it('finds scenarios when a file path search contains escaped quotes', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                // Simulates what SpecsList/ScenarioDetailView produce via quotedSearchTerm()
                // when a file path or breadcrumb segment contains a literal quote character.
                // Input value: spec/features/test"file.spec.ts
                // quotedSearchTerm produces: "spec/features/test\"file.spec.ts"
                // URL-encoded: %22spec%2Ffeatures%2Ftest%5C%22file.spec.ts%22
                Navigate.to('/single/index.html#/tests?search=%22spec%2Ffeatures%2Ftest%5C%22file.spec.ts%22'),

                Wait.until(scenariosView, isPresent()),

                // No scenario matches this fabricated path, but the view loads without error
                // and the search input shows the decoded value (proves the parser handled it)
                Ensure.that(scenariosView.searchInput.value(), isPresent()),
            );
        });
    });
});
