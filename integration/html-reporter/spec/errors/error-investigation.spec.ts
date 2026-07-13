import { Ensure, equals, includes } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { authFailure, failingTest, timeoutTest } from '../../src/scenarios';

describe('Errors', () => {

    describe('Error Investigation', () => {

        it('shows timeout and assertion errors grouped together', async ({ actor, errorsView }) => {
            await actor.attemptsTo(
                errorsView.open(),

                Ensure.that(errorsView.scenarioCalled(timeoutTest).isPresent(), equals(true)),
                Ensure.that(errorsView.scenarioCalled(failingTest).isPresent(), equals(true)),
            );
        });

        it('shows error patterns across failure categories', async ({ actor, errorsView }) => {
            await actor.attemptsTo(
                errorsView.open(),

                Ensure.that(errorsView.scenarioCalled(timeoutTest).isPresent(), equals(true)),
                Ensure.that(errorsView.scenarioCalled(authFailure).isPresent(), equals(true)),
            );
        });

        it('displays error category summary cards', async ({ actor, errorsView }) => {
            await actor.attemptsTo(
                errorsView.open(),

                Ensure.that(errorsView.kpiCardAt(0).accessibleLabel(), includes('Errors')),
                Ensure.that(errorsView.kpiCardAt(0).subtitle(), includes('test')),
            );
        });
    });
});
