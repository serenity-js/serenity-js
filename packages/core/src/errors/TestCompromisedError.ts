import { RuntimeError } from './RuntimeError';

/**
 * @desc
 *  Thrown to indicate that the test can't be performed due to an issue with a downstream dependency.
 *  For example, it makes no sense to run a full-stack integration test if we already know that
 *  the database server is down.
 *
 * @example <caption>Throwing a TestCompromisedError from a custom Interaction</caption>
 *  import { Interaction } from '@serenity-js/core';
 *
 *  const SetUpTestDatabase = () =>
 *      Interaction.where(`#actor sets up a test database`, actor => {
 *          return SomeCustomDatabaseSpecificAbility.as(actor).setUpTestDatabase().catch(error => {
 *              throw new TestCompromisedError('Could not set up the test database', error);
 *          });
 *      });
 *
 * @extends {RuntimeError}
 */
export class TestCompromisedError extends RuntimeError {

    /**
     * @param {string} message - Human-readable description of the error
     * @param {Error} [cause] - The root cause of this {@link RuntimeError}, if any
     */
    constructor(message: string, cause?: Error) {
        super(TestCompromisedError, message, cause);
    }
}
