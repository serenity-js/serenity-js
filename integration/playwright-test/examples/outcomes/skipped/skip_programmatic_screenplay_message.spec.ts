import { TestInfo } from '@playwright/test';
import { Interaction } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

function skip(testInfo: TestInfo, reason: string) {
    return Interaction.where(`#actor skips test execution`, (actor) => {
        testInfo.skip(true, reason);
    });
}

describe('Skip', () => {

    describe('Test scenario', () => {

        it('is skipped programmatically', async ({ actor }, testInfo) => {

            await actor.attemptsTo(
                skip(testInfo, 'This test is skipped programmatically')
            );
        });
    });
});
