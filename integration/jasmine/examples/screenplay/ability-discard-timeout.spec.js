const { Ability, actorCalled, configure, Duration, Interaction } = require('@serenity-js/core');

describe('Jasmine reporting', () => {

    const
        notEnough = Duration.ofMilliseconds(50),
        tooLong = Duration.ofMilliseconds(250);

    beforeAll(() => {
        configure({
            cueTimeout: notEnough,
        })
    });

    describe('A screenplay scenario', function () {

        it(`fails when discarding an ability fails`, () =>
            actorCalled('Donald')
                .whoCan(new CauseTimeoutProblemsWhenDiscarded(tooLong))
                .attemptsTo(
                    NotDoTooMuch(),
                ));
    });
});

const NotDoTooMuch = () => Interaction.where(`#actor doesn't do much`, () => void 0);

class CauseTimeoutProblemsWhenDiscarded extends Ability {
    constructor(timeout) {
        super();
        this.timeout = timeout;
    }

    discard() {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, this.timeout.inMilliseconds())
        });
    }
}
