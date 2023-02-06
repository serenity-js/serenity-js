import { Ability, Interaction } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    describe('A screenplay scenario', () => {

        it(`fails when discarding an ability fails`, async ({ actorCalled }) => {
            await actorCalled('Donald')
                .whoCan(new CauseErrorWhenDiscarded())
                .attemptsTo(
                    NotDoTooMuch(),
                );
        });
    });
});

const NotDoTooMuch = () => Interaction.where(`#actor doesn't do much`, () => void 0);

class CauseErrorWhenDiscarded extends Ability {
    discard() {
        return Promise.reject(new TypeError(`Some internal error in ability`));
    }
}
