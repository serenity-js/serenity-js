import { Ability, Duration, Interaction } from '@serenity-js/core';
import { describe, it, test } from '@serenity-js/playwright-test';

describe('Playwright Test reporting', () => {

    const
        notEnough = Duration.ofMilliseconds(50),
        tooLong = Duration.ofMilliseconds(250);

    test.use({
        cueTimeout: notEnough
    });

    describe('A screenplay scenario', () => {

        test.setTimeout(1_000)

        it(`fails when discarding an ability fails`, async ({ actorCalled }) => {
            await actorCalled('Donald')
                .whoCan(new CauseTimeoutProblemsWhenDiscarded(tooLong))
                .attemptsTo(
                    NotDoTooMuch(),
                );
        });
    });
});

const NotDoTooMuch = () => Interaction.where(`#actor doesn't do much`, () => void 0);

class CauseTimeoutProblemsWhenDiscarded extends Ability {
    constructor(private readonly timeout: Duration) {
        super();
    }

    discard() {
        return new Promise((resolve) => {
            setTimeout(resolve, this.timeout.inMilliseconds())
        });
    }
}
