/**
 * Scenario names from the example test suite, referenced by their role in the user journeys.
 */

/** A test that fails with an assertion error — used to exercise "diagnose a failure" workflows */
export const failingTest = 'Payment should reject an expired card';

/** A test that was passing in a previous run but now fails — demonstrates degraded/inconsistent state */
export const degradedTest = 'Completion should complete an item';

/** A test that fails with a timeout — used to exercise "investigate slow/timeout" workflows */
export const timeoutTest = 'Login should display a timeout error when the server is slow';

/** A second authentication failure — used to demonstrate error clustering in a feature area */
export const authFailure = 'Password Reset should validate the reset token';
