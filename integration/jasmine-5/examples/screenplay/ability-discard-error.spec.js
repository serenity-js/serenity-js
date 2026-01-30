const { Ability, actorCalled, Interaction } = require('@serenity-js/core');

describe('Jasmine reporting', () => {

    describe('A screenplay scenario', () => {

        it(`fails when discarding an ability fails`, () =>
            actorCalled('Donald')
                .whoCan(new CauseErrorWhenDiscarded()).attemptsTo(
                    NotDoTooMuch(),
                ));
    });
});

const NotDoTooMuch = () => Interaction.where(`#actor doesn't do much`, () => void 0);

class CauseErrorWhenDiscarded extends Ability {
    discard() {
        return Promise.reject(new TypeError(`Some internal error in ability`));
    }
}
