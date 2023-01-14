const { Ability, actorCalled, engage, Interaction } = require('@serenity-js/core');

describe('Mocha reporting', () => {

    before(() => engage(new Actors()));

    describe('A screenplay scenario', () => {

        // even if an ability is not discarded successfully, the subsequent tests should still be executed
        it(`fails when discarding an ability fails`, () =>
            actorCalled('Donald')
                .attemptsTo(
                    NotDoTooMuch(),
                ));

        it(`succeeds when ability is discarded successfully`, () =>
            actorCalled('Alice')
                .attemptsTo(
                    NotDoTooMuch(),
                ));

        it(`fails if the ability fails to discard again`, () =>
            actorCalled('Donald')
                .attemptsTo(
                    NotDoTooMuch(),
                ));
    });
});

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
