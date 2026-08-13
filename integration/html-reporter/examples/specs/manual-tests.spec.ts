import { Task, the } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

describe('Exploratory tests', () => {

    it('should verify accessibility @manual', async ({ actor }) => {
        await actor.attemptsTo(
            Task.where(the`#actor performs accessibility audit`),
        );
    });

    it('should verify print layout @manual', async ({ actor }) => {
        await actor.attemptsTo(
            Task.where(the`#actor verifies print layout`),
        );
    });
});
