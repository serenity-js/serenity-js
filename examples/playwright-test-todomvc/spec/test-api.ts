import { Notepad,TakeNotes } from '@serenity-js/core';
import { useFixtures } from '@serenity-js/playwright-test';

import { testData } from './test-data';

export interface MyNotes {
    initialItems: string[];
    expectedItems: string[];
}

export const {
    describe,
    it,
    test,
} = useFixtures({
    
    // The `actor` fixture is provided by the `@serenity-js/playwright-test` module.
    // You can override it to provide additional abilities to the Actor,
    // or to configure the Actor's initial state.
    actor: async ({ actor }, use) => {
        await use(
            actor.whoCan(
                // Override the default ability to TakeNotes to provide an initial state
                TakeNotes.using<MyNotes>(Notepad.with({
                    initialItems: Array.from(testData.items),
                    expectedItems: [],
                }))
            )
        );
    },
});