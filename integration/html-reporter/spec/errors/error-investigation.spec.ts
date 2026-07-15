import { Ensure, equals, includes } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { failingTest, timeoutTest } from '../../src/scenarios';

describe('Errors', () => {

    describe('Error Investigation', () => {

        it('lists failing scenarios grouped by error type', async ({ actor, errorsView }) => {
            await actor.attemptsTo(
                errorsView.open(),

                Ensure.that(errorsView.scenarioCalled(timeoutTest).isPresent(), equals(true)),
                Ensure.that(errorsView.scenarioCalled(failingTest).isPresent(), equals(true)),
            );
        });

        it('shows error category summary with scenario counts', async ({ actor, errorsView }) => {
            await actor.attemptsTo(
                errorsView.open(),

                Ensure.that(errorsView.kpiCardCalled('Errors').accessibleLabel(), includes('Errors')),
                Ensure.that(errorsView.kpiCardCalled('Errors').subtitle(), includes('test')),
            );
        });
    });
});
