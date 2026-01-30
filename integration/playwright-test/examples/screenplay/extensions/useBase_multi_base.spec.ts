import { test as baseTest } from '@playwright/test';
import { Log } from '@serenity-js/core';
import { useBase } from '@serenity-js/playwright-test';

interface FirstTestFixtures {
    firstTestMarker: string;
}

interface FirstWorkerFixtures {
    firstWorkerMarker: string;
}

interface SecondTestFixtures {
    secondTestMarker: string;
}

interface SecondWorkerFixtures {
    secondWorkerMarker: string;
}

interface ExtraTestFixtures {
    extraTestMarker: string;
}

interface ExtraWorkerFixtures {
    extraWorkerMarker: string;
}

const firstBase = baseTest.extend<FirstTestFixtures, FirstWorkerFixtures>({

    firstTestMarker: async ({}, use) => {
        await use('first test marker')
    },

    firstWorkerMarker: [ async ({}, use) => {
        await use('first worker marker')
    }, { scope: 'worker' } ]
});

const secondBase = baseTest.extend<SecondTestFixtures, SecondWorkerFixtures>({

    secondTestMarker: async ({}, use) => {
        await use('second test marker')
    },

    secondWorkerMarker: [ async ({}, use) => {
        await use('second worker marker')
    }, { scope: 'worker' } ]
});

const { describe, it } = useBase(firstBase, secondBase).useFixtures<ExtraTestFixtures, ExtraWorkerFixtures>({

    extraTestMarker: async ({ firstTestMarker, secondTestMarker }, use) => {
        await use([ firstTestMarker, secondTestMarker ].join(', '))
    },

    extraWorkerMarker: [ async ({ firstWorkerMarker, secondWorkerMarker }, use) => {
        await use([ firstWorkerMarker, secondWorkerMarker ].join(', '))
    }, { scope: 'worker' } ]
});

describe('useBase', () => {

    it('loads custom fixtures', async ({ actor, extraTestMarker, extraWorkerMarker }) => {
        await actor.attemptsTo(
            Log.the(extraTestMarker),
            Log.the(extraWorkerMarker),
        );
    });
});

