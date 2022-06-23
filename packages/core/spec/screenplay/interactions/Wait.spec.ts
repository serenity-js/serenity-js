import { describe, it } from 'mocha';

import { Ability, Answerable, AssertionError, Cast, Duration, Expectation, Interaction, Question, Serenity, Timestamp, UsesAbilities, Wait } from '../../../src';
import { expect } from '../../expect';
import { Ensure } from '../Ensure';

/** @test {Wait} */
describe('Wait', () => {

    let serenity: Serenity;

    beforeEach(async () => {
        serenity = new Serenity();
        serenity.engage(Cast.whereEveryoneCan(new UseAStopwatch()))

        await serenity.theActorCalled('Wendy')
            .attemptsTo(
                Ensure.equal(Stopwatch.elapsedTime(), Duration.ofMilliseconds(0)),
            )
    });

    afterEach(() =>
        serenity.theActorCalled('Wendy')
            .attemptsTo(Stopwatch.stop())
    );

    describe('for', () => {

        /** @test {Wait.for} */
        it('pauses the actor flow for the length of an explicitly-set duration', () =>
            serenity.theActorCalled('Wendy')
                .attemptsTo(
                    Stopwatch.start(),
                    Wait.for(Duration.ofMilliseconds(100)),
                    Stopwatch.stop(),
                    Ensure.greaterThanOrEqual(Stopwatch.elapsedTime().inMilliseconds(), 100)
                ));

        /** @test {Wait#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Wait.for(Duration.ofMilliseconds(300)).toString())
                .to.equal(`#actor waits for 300ms`);
        });
    });

    describe('until', () => {

        /** @test {Wait.until} */
        it('pauses the actor flow until the expectation is met, polling for result every 500ms by default', () =>
            serenity.theActorCalled('Wendy')
                .attemptsTo(
                    Stopwatch.start(),
                    Wait.until(Stopwatch.elapsedTime().inMilliseconds().describedAs('elapsed time [ms]'), isGreaterThan(250)),
                    Stopwatch.stop(),
                    Ensure.greaterThanOrEqual(Stopwatch.elapsedTime().inMilliseconds(), 500),
                    Ensure.lessThan(Stopwatch.elapsedTime().inMilliseconds(), 1000),
                ));

        /** @test {Wait.until} */
        it('pauses the actor flow until the expectation is met, with a configurable polling interval', () =>
            serenity.theActorCalled('Wendy')
                .attemptsTo(
                    Stopwatch.start(),
                    Wait.until(Stopwatch.elapsedTime().inMilliseconds().describedAs('elapsed time [ms]'), isGreaterThan(250)).pollingEvery(Duration.ofMilliseconds(10)),
                    Stopwatch.stop(),
                    Ensure.greaterThanOrEqual(Stopwatch.elapsedTime().inMilliseconds(), 250),
                    Ensure.lessThan(Stopwatch.elapsedTime().inMilliseconds(), 500),
                ));

        /** @test {Wait.upTo} */
        /** @test {Wait.until} */
        it('fails the actor flow when the timeout expires', () =>
            expect(
                serenity.theActorCalled('Wendy')
                    .attemptsTo(
                        Stopwatch.start(),
                        Wait.upTo(Duration.ofMilliseconds(50))
                            .until(Stopwatch.elapsedTime().inMilliseconds().describedAs('elapsed time [ms]'), isGreaterThan(250))
                            .pollingEvery(Duration.ofMilliseconds(10)),
                    )
            ).to.be.rejected.then((error: AssertionError) => {
                expect(error).to.be.instanceOf(AssertionError);
                expect(error.message).to.be.equal(`Waited 50ms, polling every 10ms, for elapsed time [ms] to have value greater than 250`);
                expect(error.expected).to.be.equal(250);
                expect(error.actual).to.be.greaterThanOrEqual(50);
            }));

        it('fails the actor flow when asking the question results in an error', () =>
            expect(
                serenity.theActorCalled('Wendy')
                    .attemptsTo(
                        Wait.upTo(Duration.ofMilliseconds(50))
                            .until(Question.about<number>('error', actor => { throw Error('error in question') }), isGreaterThan(250))
                            .pollingEvery(Duration.ofMilliseconds(10)),
                    )
            ).to.be.rejected.then((error: Error) => {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.be.equal(`error in question`);
            }));

        it('fails the actor flow when invoking the expectation results in an error', () =>
            expect(
                serenity.theActorCalled('Wendy')
                    .attemptsTo(
                        Wait.upTo(Duration.ofMilliseconds(50))
                            .until(undefined, brokenExpectationThatThrows('error in expectation'))
                            .pollingEvery(Duration.ofMilliseconds(10)),
                    )
            ).to.be.rejected.then((error: Error) => {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.be.equal(`error in expectation`);
            }));

        /** @test {Wait#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(
                Wait.upTo(Duration.ofMilliseconds(50))
                    .until(Stopwatch.elapsedTime().inMilliseconds().describedAs('elapsed time [ms]'), isGreaterThan(250))
                    .pollingEvery(Duration.ofMilliseconds(10)).toString()
            ).to.equal(`#actor waits up to 50ms, polling every 10ms, until elapsed time [ms] does have value greater than 250`);
        });
    });
});

function brokenExpectationThatThrows(message: string): Expectation<any> {
    return Expectation.thatActualShould<any, any>('throw an Exception', undefined)
        .soThat((actualValue, expectedValue) => {
            throw new Error(message);
        });
}

function isGreaterThan(expected: Answerable<number>): Expectation<number> {
    return Expectation.thatActualShould<number, number>('have value greater than', expected)
        .soThat((actualValue, expectedValue) => actualValue > expectedValue);
}

class UseAStopwatch implements Ability {

    static as(actor: UsesAbilities): UseAStopwatch {
        return actor.abilityTo(UseAStopwatch);
    }

    constructor(public readonly stopwatch = new Stopwatch()) {
    }
}

class Stopwatch {
    private startTime: Timestamp;
    private elapsedTime: Duration = Duration.ofMilliseconds(0);
    private interval: NodeJS.Timeout;

    static start = () =>
        Interaction.where(`#actor starts their stopwatch`, actor => {
            return UseAStopwatch.as(actor).stopwatch.start();
        });

    static elapsedTime = () =>
        Question.about('elapsed time', actor => {
            return UseAStopwatch.as(actor).stopwatch.elapsedTime;
        })

    static stop = () =>
        Interaction.where(`#actor stops their stopwatch`, actor => {
            return UseAStopwatch.as(actor).stopwatch.stop();
        });

    start() {
        this.startTime = new Timestamp();
        this.interval = setInterval(() => {
            this.elapsedTime = new Timestamp().diff(this.startTime);
        }, 50)
    }

    stop() {
        clearInterval(this.interval);
    }
}
