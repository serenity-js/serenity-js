import { ensure, isGreaterThanOrEqualTo, isInRange } from 'tiny-types';

import { AssertionError, TimeoutExpiredError } from '../../errors';
import { d } from '../../io';
import { Duration } from '../../model';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';
import { Expectation, ExpectationMet, ExpectationOutcome } from '../questions';
import { WaitBuilder } from './WaitBuilder';

/**
 * `Wait` is a synchronisation statement that instructs the {@link Actor}
 * to wait before proceeding with their next {@link Activity|activity},
 * either for a set {@link Duration}, or until a given {@link Expectation} is met.
 *
 * **Please note** that Serenity/JS implements `Wait` from scratch, so that
 * the behaviour is consistent no matter the integration tool you use (Playwright, WebdriverIO, Selenium, etc.)
 * or the type of testing you do (Web, REST API, component testing, etc.)
 *
 * ## Wait with Web-based tests
 *
 * ### Example widget
 *
 * ```html
 * <!--
 *     After about 1 second, the text will change from 'Loading...' to 'Ready!'
 * -->
 * <h1 id="status">Loading...</h1>
 * <script>
 *     (function () {
 *         setTimeout(function () {
 *             document.getElementById('status').textContent = 'Ready!'
 *         }, 1000);
 *     })();
 * </script>
 * ```
 *
 * ### Lean Page Object describing the widget
 *
 * ```ts
 * import { By, PageElement, Text } from '@serenity-js/web'
 *
 * class App {
 *   static status = () =>
 *      Text.of(PageElement.located(By.id('status'))
 *          .describedAs('status widget'))
 *  }
 * ```
 *
 * ### Waiting for a set amount of time
 *
 * ```ts
 * import { actorCalled, Duration, Wait } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { Browser, chromium } from 'playwright'
 *
 * const browser = await chromium.launch({ headless: true })
 *
 * await actorCalled('Inês')
 *   .whoCan(BrowseTheWebWithPlaywright.using(browser))
 *   .attemptsTo(
 *     Wait.for(Duration.ofMilliseconds(1_500)),
 *     Ensure.that(App.status(), equals('Ready!')),
 *   );
 * ```
 *
 * **Please note** that while the above implementation works,
 * this approach is inefficient because at best
 * the actor might wait too long and at worst the test
 * might become "flaky" if any external interference
 * (like network glitches, animations taking a bit too long etc.)
 * makes the actor wait not long enough.
 *
 * ### Waiting until a condition is met
 *
 * ```ts
 * import { actorCalled, Wait } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { equals } from '@serenity-js/assertions'
 * import { Browser, chromium } from 'playwright'
 *
 * const browser = await chromium.launch({ headless: true })
 *
 * await actorCalled('Wendy')
 *   .whoCan(BrowseTheWebWithPlaywright.using(browser))
 *   .attemptsTo(
 *     Wait.until(App.status(), equals('Ready!')),
 *     // app is ready, proceed with the scenario
 *   );
 * ```
 *
 * `Wait.until` makes the {@link Actor} keep asking the {@link Question},
 * in this case `Text.of(App.status)`, until the answer meets
 * the expectation, or a timeout expires (default: 5s).
 *
 * **Please note** that both Ensure and Wait can be used with
 * the same expectations, like `equals` or `includes`.
 *
 * ### Changing the default timeout
 *
 * ```ts
 *  import { actorCalled, Duration, Wait } from '@serenity-js/core';
 *  import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
 *  import { equals } from '@serenity-js/assertions';
 *  import { Browser, chromium } from 'playwright';
 *
 *  const browser: Browser = await chromium.launch({ headless: true });
 *
 *  await actorCalled('Polly')
 *      .whoCan(BrowseTheWebWithPlaywright.using(browser))
 *      .attemptsTo(
 *          Wait.upTo(Duration.ofSeconds(3))
 *              .until(App.status(), equals('Ready!')),
 *          // app is ready, proceed with the scenario
 *      );
 * ```
 *
 * ## Learn more
 * - {@link Duration}
 * - {@link Expectation}
 *
 * @group Interactions
 */
export class Wait {

    /**
     * Default timeout of 5 seconds, used with [[Wait.until]].
     *
     * Use [[Wait.upTo]] to override it for a given interaction.
     */
    static readonly defaultTimeout = Duration.ofSeconds(5);

    /**
     * Minimum timeout that can be used with [[Wait.until]],
     * defaults to 250 milliseconds,
     */
    static readonly minimumTimeout = Duration.ofMilliseconds(250);

    /**
     * The amount of time [[Wait.until]] should wait between condition checks,
     * defaults to 500ms.
     *
     * Use [[WaitUntil.pollingEvery]] to override it for a given interaction.
     *
     * @type {Duration}
     */
    static readonly defaultPollingInterval = Duration.ofMilliseconds(500);

    /**
     * Minimum polling interval of 50ms between condition checks, used with [[Wait.until]].
     */
    static readonly minimumPollingInterval = Duration.ofMilliseconds(50);

    /**
     * Instantiates a version of this {@link Interaction}
     * configured to wait for a set duration.
     *
     * @param duration
     *  A set duration the {@link Actor} should wait for before proceeding.
     */
    static for(duration: Answerable<Duration>): Interaction {
        return new WaitFor(duration);
    }

    /**
     * Instantiates a version of this {@link Interaction}
     * configured to wait until the answer to the question (`actual`) meets the `expectation`,
     * or the timeout expires.
     *
     * @param timeout
     *  Custom timeout to override {@link Wait.defaultTimeout}
     */
    static upTo(timeout: Duration): WaitBuilder {
        return {
            until: <Actual>(actual: Answerable<Actual>, expectation: Expectation<Actual>): WaitUntil<Actual> =>
                new WaitUntil(
                    actual,
                    expectation,
                    timeout,
                    Wait.defaultPollingInterval.isLessThan(timeout) ? Wait.defaultPollingInterval : timeout
                ),
        };
    }

    /**
     * Instantiates a version of this {@link Interaction} configured to
     * poll every [[Wait.defaultPollingInterval]] for the result of the provided
     * question (`actual`) until it meets the `expectation`,
     * or the timeout expires.
     *
     * @param actual
     *  An {@link Answerable} that the {@link Actor} will keep answering
     *  until the answer meets the {@link Expectation} provided, or the timeout expires.
     *
     * @param expectation
     *  An {@link Expectation} to be met before proceeding
     */
    static until<Actual>(actual: Answerable<Actual>, expectation: Expectation<Actual>): WaitUntil<Actual> {
        return new WaitUntil(
            actual,
            expectation,
            Wait.defaultTimeout,
            Wait.defaultPollingInterval
        );
    }
}

/**
 * @package
 */
class WaitFor extends Interaction {
    constructor(private readonly duration: Answerable<Duration>) {
        super();
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const duration = await actor.answer(this.duration);

        return waitFor(duration).start();
    }

    toString(): string {
        return d`#actor waits for ${ this.duration }`;
    }
}

/**
 * Synchronisation statement that instructs the {@link Actor} to wait before proceeding until a given {@link Expectation} is met.
 *
 * **PRO TIP:** To instantiate this {@link Interaction}, use [[Wait.until]].
 *
 * ## Learn more
 * * [[Wait.until]]
 *
 * @group Interactions
 */
export class WaitUntil<Actual> extends Interaction {
    constructor(
        private readonly actual: Answerable<Actual>,
        private readonly expectation: Expectation<Actual>,
        private readonly timeout: Duration,
        private readonly pollingInterval: Duration,
    ) {
        super();
        ensure('Timeout', timeout.inMilliseconds(), isGreaterThanOrEqualTo(Wait.minimumTimeout.inMilliseconds()))
        ensure('Polling interval', pollingInterval.inMilliseconds(), isInRange(Wait.minimumPollingInterval.inMilliseconds(), timeout.inMilliseconds()))
    }

    /**
     * Configure how frequently the {@link Actor} should check if the answer meets the expectation.
     *
     * @param interval
     */
    pollingEvery(interval: Duration): Interaction {
        return new WaitUntil(this.actual, this.expectation, this.timeout, interval);
    }

    /**
     * @inheritDoc
     */
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        let outcome: ExpectationOutcome<unknown, Actual>;

        const expectation = async () => {
            outcome = await actor.answer(
                this.expectation.isMetFor(this.actual)
            );

            return outcome instanceof ExpectationMet;
        }

        const timeout = timeoutAfter(this.timeout);
        const poller  = waitUntil(expectation, this.pollingInterval);

        return Promise.race([
            timeout.start(),
            poller.start(),
        ]).
        then(() => {
            timeout.stop();
            poller.stop();
        }).
        catch(error => {
            timeout.stop();
            poller.stop();

            if (error instanceof TimeoutExpiredError) {
                throw new AssertionError(
                    d`Waited ${ this.timeout }, polling every ${ this.pollingInterval }, for ${ this.actual } to ${ this.expectation }`,
                    outcome?.expected,
                    outcome?.actual,
                    error,
                )
            }

            throw error;
        });
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return d`#actor waits up to ${ this.timeout }, polling every ${ this.pollingInterval }, until ${ this.actual } does ${ this.expectation }`;
    }
}

function waitFor(duration: Duration): { start: () => Promise<void>, stop: () => void } {
    let timeoutId: NodeJS.Timeout;

    return {
        start() {
            return new Promise((resolve, reject_) => {
                timeoutId = setTimeout(() => {
                    clearTimeout(timeoutId);
                    resolve();
                }, duration.inMilliseconds());
            })
        },

        stop() {
            clearTimeout(timeoutId);
        }
    };
}

function waitUntil(expectation: () => Promise<boolean> | boolean, pollingInterval: Duration): { start: () => Promise<void>, stop: () => void } {
    let delay: { start: () => Promise<void>, stop: () => void };
    let pollingActive = false;

    async function poll(): Promise<void> {
        try {
            const expectationIsMet = await expectation();

            if (expectationIsMet) {
                delay?.stop();
                return;
            }

            if (pollingActive) {
                delay = waitFor(pollingInterval);

                await delay.start();

                await poll();
            }
        } catch (error) {
            delay?.stop()
            throw error;
        }
    }

    return {
        async start () {
            pollingActive = true;
            await poll();
        },

        stop () {
            delay?.stop();
            pollingActive = false;
        }
    };
}

function timeoutAfter(duration: Duration): { start: () => Promise<void>, stop: () => void } {

    let timeoutId: NodeJS.Timeout;

    return {
        start: () =>
            new Promise<void>((resolve, reject) => {
                timeoutId = setTimeout(() => {
                    clearTimeout(timeoutId);
                    reject(new TimeoutExpiredError(
                        d`Timeout of ${ duration } has expired`,
                        duration,
                    ));
                }, duration.inMilliseconds());
            }),

        stop: () => {
            clearTimeout(timeoutId);
        }
    };
}
