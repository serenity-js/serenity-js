import { Ability, Interaction } from '@serenity-js/core';
import { describe, it, test } from '@serenity-js/playwright-test';

class Actors {
    prepare(actor) {
        switch (actor.name) {
            case 'Donald':
                return actor.whoCan(new CauseErrorWhenAbilityDiscarded());
            default:
                return actor.whoCan(new SucceedWhenAbilityDiscarded());
        }
    }
}

const NotDoTooMuch = () => Interaction.where(`#actor doesn't do much`, () => void 0);

class CauseErrorWhenAbilityDiscarded extends Ability {
    discard() {
        return Promise.reject(new TypeError(`Some internal error in ability`));
    }
}

class SucceedWhenAbilityDiscarded extends Ability {
    discard() {
        return Promise.resolve();
    }
}

describe('Playwright Test reporting', () => {

    test.use({
        actors: new Actors()
    });

    describe('A screenplay scenario', () => {

        // even if an ability is not discarded successfully, the subsequent tests should still be executed
        it(`fails when discarding an ability fails`, async ({ actorCalled }) => {
            await actorCalled('Donald')
                .attemptsTo(
                    NotDoTooMuch(),
                );
        });

        it(`succeeds when ability is discarded successfully`, async ({ actorCalled }) => {
            await actorCalled('Alice')
                .attemptsTo(
                    NotDoTooMuch(),
                );
        });

        it(`fails if the ability fails to discard again`, async ({ actorCalled }) => {
            await actorCalled('Donald')
                .attemptsTo(
                    NotDoTooMuch(),
                );
        });
    });
});
