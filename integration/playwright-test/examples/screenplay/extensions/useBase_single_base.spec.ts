import { test as baseTest } from '@playwright/test';
import { Log } from '@serenity-js/core';
import { useBase } from '@serenity-js/playwright-test';

interface TestFixtures {
    marker: string;
}

const { describe, it } = useBase(baseTest).useFixtures<TestFixtures>({
    // eslint-disable-next-line no-empty-pattern
    marker: async ({  }, use) => {
        await use('my-marker')
    },
});

describe('useBase', () => {

    it('loads custom fixtures', async ({ actor, marker }) => {
        await actor.attemptsTo(
            Log.the(marker),
        );
    });
});

