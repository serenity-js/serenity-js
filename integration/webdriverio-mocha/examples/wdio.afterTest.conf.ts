import { config as baseConfig } from './wdio.conf';

// Marker prefix for afterTest hook output, used by integration tests to verify hook invocation
const AFTER_TEST_MARKER = '[AfterTest]';

export const config: typeof baseConfig = {
    ...baseConfig,

    /**
     * Hook that gets executed after a test (in Mocha/Jasmine only)
     * This hook is used to verify that Serenity/JS correctly awaits the afterTest hook
     * before completing the test scenario.
     */
    afterTest: async function (test, _context, result) {
        // Log the hook invocation with test details for verification
        console.log(`${ AFTER_TEST_MARKER }${ JSON.stringify({
            title: test.title,
            passed: result.passed,
            duration: result.duration,
        }) }`);

        // Simulate an async operation to verify the hook is properly awaited
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log(`${ AFTER_TEST_MARKER }${ JSON.stringify({
            event: 'completed',
            title: test.title,
        }) }`);
    },
};
