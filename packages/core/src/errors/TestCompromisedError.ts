import { RuntimeError } from './RuntimeError';

/**
 * @desc Thrown when the test can't be performed due to an issue with a downstream dependency.
 * For example, it makes no sense to run a full-stack integration test if we already know that the database server
 * is down.
 *
 * @example <caption></caption>
 * const SetUpTestDatabase = () => Interaction.where(`#actor sets up a test database`, actor => {
 *     return SomeCustomDatabaseSpecificAbility.as(actor).setUpTestDatabase().catch(error => {
 *         throw new TestCompromisedError('Could not set up the test database', error);
 *     });
 * });
 *
 */
export class TestCompromisedError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(TestCompromisedError, message, cause);
    }
}
