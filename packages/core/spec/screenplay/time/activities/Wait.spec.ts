
import { describe, it } from 'mocha';
import { equal } from 'tiny-types/lib/objects';

import type { Answerable} from '../../../../src';
import { Ability, AssertionError, Cast, Duration, Expectation, Interaction, List, NoOpDiffFormatter, Question, Serenity, Timestamp, Wait } from '../../../../src';
import { trimmed } from '../../../../src/io';
import { expect } from '../../../expect';
import { Ensure } from '../../Ensure';

describe('Wait', () => {

    let serenity: Serenity;

    beforeEach(async () => {
        serenity = new Serenity();
        serenity.configure({
            actors: Cast.where(actor => actor.whoCan(new UseAStopwatch())),
            diffFormatter: new NoOpDiffFormatter(),
        });

        await serenity.theActorCalled('Wendy')
            .attemptsTo(
                Ensure.equal(Stopwatch.elapsedTime(), Duration.ofMilliseconds(0)),
            )
    });

    afterEach(async () => {
        await serenity.theActorCalled('Wendy')
            .attemptsTo(Stopwatch.stop());

        await serenity.theActorCalled('Wendy').dismiss();
    });

    describe('for', () => {

        it('pauses the actor flow for the length of an explicitly-set duration', async () => {
            const timeout       = Duration.ofMilliseconds(2_000),
                tolerance       = Duration.ofMilliseconds(500);

            await serenity.theActorCalled('Wendy')
                .attemptsTo(
                    Stopwatch.start(),
                    Wait.for(timeout),
                    Stopwatch.stop(),
                    Ensure.closeTo(
                        Stopwatch.elapsedTime().inMilliseconds(),
                        timeout.plus(tolerance).inMilliseconds(),
                        tolerance.plus(tolerance).inMilliseconds()
                    ),
                );
        });

        it('provides a sensible description of the interaction being performed', () => {
            expect(Wait.for(Duration.ofMilliseconds(300)).toString())
                .to.equal(`#actor waits for 300ms`);
        });
    });

    describe('until', () => {

        it('pauses the actor flow until the expectation is met, polling for result every 500ms by default', async () => {
            const pollingInterval = Wait.defaultPollingInterval,
                halfAnInterval    = Math.round(pollingInterval.inMilliseconds() / 2),
                twoIntervals      = Math.round(pollingInterval.inMilliseconds() * 2),
                elapsedTime       = Stopwatch.elapsedTime().inMilliseconds().describedAs('elapsed time [ms]');

            await serenity.theActorCalled('Wendy')
                .attemptsTo(
                    Stopwatch.start(),
                    Wait.until(elapsedTime, isGreaterThan(halfAnInterval)),
                    Stopwatch.stop(),
                    Ensure.closeTo(elapsedTime, pollingInterval.inMilliseconds(), halfAnInterval),
                    Ensure.lessThan(elapsedTime, twoIntervals),
                )
        });

        it('pauses the actor flow until the expectation is met, with a configurable polling interval', async () => {
            const timeout       = Duration.ofMilliseconds(500),
                pollingInterval = Duration.ofMilliseconds(250),
                twoIntervals    = pollingInterval.plus(pollingInterval),
                elapsedTime     = Stopwatch.elapsedTime().inMilliseconds().describedAs('elapsed time [ms]');

            await serenity.theActorCalled('Wendy')
                .attemptsTo(
                    Stopwatch.start(),
                    Wait.until(elapsedTime, isGreaterThan(timeout.inMilliseconds()))
                        .pollingEvery(pollingInterval),
                    Stopwatch.stop(),
                    Ensure.closeTo(Stopwatch.elapsedTime().inMilliseconds(), timeout.plus(pollingInterval).inMilliseconds(), pollingInterval.inMilliseconds()),
                    Ensure.lessThan(Stopwatch.elapsedTime().inMilliseconds(), timeout.plus(twoIntervals).inMilliseconds()),
                );
        });

        it('fails the actor flow when the timeout expires', async () => {

            const
                timeout         = Duration.ofMilliseconds(1_000),
                tooMuch         = Duration.ofMilliseconds(2_000),
                elapsedTime     = Stopwatch.elapsedTime().inMilliseconds().describedAs('elapsed time [ms]'),
                pollingInterval = Duration.ofMilliseconds(250);

            await expect(
                serenity.theActorCalled('Wendy')
                    .attemptsTo(
                        Stopwatch.start(),
                        Wait.upTo(timeout)
                            .until(elapsedTime, isGreaterThan(tooMuch.inMilliseconds()))
                            .pollingEvery(pollingInterval),
                    )
            ).to.be.rejected.then((error: AssertionError) => {
                expect(error).to.be.instanceOf(AssertionError);
                expect(error.message).to.match(new RegExp(trimmed`
                    | Timeout of ${ timeout } has expired while waiting for elapsed time \\[ms\] to have value greater than ${ tooMuch.inMilliseconds() }
                    |
                    | Expectation: isGreaterThan\\(${ tooMuch.inMilliseconds() }\\)
                    |
                    | Expected number: ${ tooMuch.inMilliseconds() }
                    | Received number: \\d+
                    |`, 'gm'));
            })
        });

        it('fails the actor flow when accessing the first item of an empty list after the timeout has expired', async () => {

            const emptyList = List.of([]);
            const startTime = Date.now();

            await expect(
                serenity.theActorCalled('Wendy')
                    .attemptsTo(
                        Wait.until(emptyList.first(), isGreaterThan(1)),
                    )
            ).to.be.rejected.then((error: AssertionError) => {
                const elapsedTime = Date.now() - startTime;
                expect(elapsedTime).to.be.greaterThanOrEqual(5000);
                expect(error).to.be.instanceOf(AssertionError);

                expect(error.message).to.match(new RegExp(trimmed`
                    | Timeout of 5s has expired while waiting for the first of \\[ \\] to have value greater than 1
                    | \\s{4}at.*Wait.spec.ts:132:30
                `));
            })
        });

        it('pauses the actor flow until a delayed item is loaded and continues before the timeout expires', async () => {

            const numbersLoadedAfterADelay = () =>
                Question.about('lazy-loaded numbers', actor => {
                    const elapsedTime = UseAStopwatch.as(actor).stopwatch.elapsed().inMilliseconds();

                    if (elapsedTime < 1_000) {
                        return [];
                    }

                    return [ 1, 2, 3 ];
                });

            const lazyLoadedList = () =>
                List.of(numbersLoadedAfterADelay());

            await serenity.theActorCalled('Wendy')
                    .attemptsTo(
                        Stopwatch.start(),
                        Wait.upTo(Duration.ofSeconds(7))
                            .until(lazyLoadedList().first(), equals(1)),
                        Stopwatch.stop(),
                        Ensure.greaterThanOrEqual(Stopwatch.elapsedTime().inMilliseconds(), 1000),
                        Ensure.lessThan(Stopwatch.elapsedTime().inMilliseconds(), 2000),
                    );
        });

        it('fails the actor flow until when a delayed item list is not loaded until timeout expires', async () => {

            const numbersLoadedAfterADelay = () =>
                Question.about('lazy-loaded numbers', actor => {
                    const elapsedTime = UseAStopwatch.as(actor).stopwatch.elapsed().inMilliseconds();

                    if (elapsedTime < 5_000) {
                        return [];
                    }

                    return [ 1, 2, 3 ];
                });

            const lazyLoadedList = () =>
                List.of(numbersLoadedAfterADelay());

            await expect(serenity.theActorCalled('Wendy')
                .attemptsTo(
                    Stopwatch.start(),
                    Wait.upTo(Duration.ofSeconds(1))
                        .until(lazyLoadedList().first(), equals(1)),
                    Stopwatch.stop(),
                    Ensure.greaterThanOrEqual(Stopwatch.elapsedTime().inMilliseconds(), 1_000),
                    Ensure.lessThan(Stopwatch.elapsedTime().inMilliseconds(), 1_200),
                )
            ).
            to.be.rejected.then((error: AssertionError) => {
                expect(error).to.be.instanceOf(AssertionError);
                expect(error.message).to.be.match(new RegExp(trimmed`
                    | Timeout of 1s has expired while waiting for the first of lazy-loaded numbers to equal 1
                    | \\s{4}at.*Wait.spec.ts:193:26
                `));
            });
        });

        it('fails the actor flow when asking the question results in an error', () =>
            expect(
                serenity.theActorCalled('Wendy')
                    .attemptsTo(
                        Wait.upTo(Duration.ofMilliseconds(250))
                            .until(Question.about<number>('error', actor => { throw new Error('error in question') }), isGreaterThan(250))
                            .pollingEvery(Duration.ofMilliseconds(50)),
                    )
            ).to.be.rejected.then((error: Error) => {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.be.equal(`error in question`);
            }));

        it('fails the actor flow when invoking the expectation results in an error', () =>
            expect(
                serenity.theActorCalled('Wendy')
                    .attemptsTo(
                        Wait.upTo(Duration.ofMilliseconds(250))
                            .until(undefined, brokenExpectationThatThrows('error in expectation'))
                            .pollingEvery(Duration.ofMilliseconds(50)),
                    )
            ).to.be.rejected.then((error: Error) => {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.be.equal(`error in expectation`);
            }));

        it('provides a sensible description of the interaction being performed', () => {
            expect(
                Wait.upTo(Duration.ofMilliseconds(250))
                    .until(Stopwatch.elapsedTime().inMilliseconds().describedAs('elapsed time [ms]'), isGreaterThan(250))
                    .pollingEvery(Duration.ofMilliseconds(50)).toString()
            ).to.equal(`#actor waits until elapsed time [ms] does have value greater than 250`);
        });

        it('complains when the timeout is less than the minimum', () => {
            expect(() =>
                Wait.upTo(Duration.ofMilliseconds(1))
                    .until(Stopwatch.elapsedTime().inMilliseconds(), isGreaterThan(250))
            ).to.throw(Error, 'Timeout should either be equal to 250 or be greater than 250');
        });

        it('complains when the polling interval is less than the minimum', () => {
            expect(() =>
                Wait.until(Stopwatch.elapsedTime().inMilliseconds(), isGreaterThan(250))
                    .pollingEvery(Duration.ofMilliseconds(1))
            ).to.throw(Error, 'Polling interval should either be equal to 50 or be greater than 50');
        });

        it('complains when the polling interval is greater than the timeout', () => {
            expect(() =>
                Wait.until(Stopwatch.elapsedTime().inMilliseconds(), isGreaterThan(250))
                    .pollingEvery(Duration.ofMilliseconds(1))
            ).to.throw(Error, 'Polling interval should either be equal to 50 or be greater than 50');
        });

        it('defaults the polling interval to the length of the timeout when timeout is less than the default polling interval', () => {
            const description = Wait.upTo(Duration.ofMilliseconds(250)).until(2, isGreaterThan(1)).toString()

            expect(description).to.equal('#actor waits until 2 does have value greater than 1');
        });
    });
});

function brokenExpectationThatThrows(message: string): Expectation<any> {
    return Expectation.thatActualShould<any, any>('throw an Error', undefined)
        .soThat((actualValue, expectedValue) => {
            throw new Error(message);
        });
}

const isGreaterThan = Expectation.define(
    'isGreaterThan', 'have value greater than',
    (actual: number, expected: number) =>
        actual > expected,
)

function equals<Expected>(expectedValue: Answerable<Expected>): Expectation<Expected> {
    return Expectation.thatActualShould<Expected, Expected>('equal', expectedValue)
        .soThat((actual, expected) => equal(actual, expected));
}

class UseAStopwatch extends Ability {

    constructor(public readonly stopwatch = new Stopwatch()) {
        super();
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

    elapsed() {
        return this.elapsedTime;
    }
}

