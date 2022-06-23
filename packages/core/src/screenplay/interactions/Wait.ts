import { AssertionError } from '../../errors';
import { d } from '../../io';
import { Duration } from '../../model';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';
import { Expectation, ExpectationMet, ExpectationOutcome } from '../questions';
import { WaitBuilder } from './WaitBuilder';

/**
 * @desc
 *  Instructs the {@link Actor} to wait before proceeding, either for a set {@link Duration},
 *  or until a given {@link Expectation} is met.
 *
 * @example <caption>Example widget</caption>
 *  <!--
 *      After about 1 second, the text will change from 'Loading...' to 'Ready!'
 *  -->
 *  <h1 id="status">Loading...</h1>
 *  <script>
 *      (function () {
 *          setTimeout(function () {
 *              document.getElementById('status').textContent = 'Ready!'
 *          }, 1000);
 *      })();
 *  </script>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { by, Target } from '@serenity-js/webdriverio';
 *
 *  class App {
 *      static status = Target.the('status widget')
 *          .located(by.id('status'));
 *  }
 *
 * @example <caption>Waiting for a set amount of time</caption>
 *  import { actorCalled, Duration, Wait } from '@serenity-js/core';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  await actorCalled('Wendy')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Wait.for(Duration.ofMilliseconds(1_500)),
 *          Ensure.that(App.status, equals('Ready!')),
 *      );
 *
 *  // Please note that while the above implementation works,
 *  // this approach is inefficient because at best
 *  // the actor might wait too long and at worst the test
 *  // might become "flaky" if any external interference
 *  // (like network glitches, animations taking a bit too long etc.)
 *  // makes the actor wait not long enough.
 *
 * @example <caption>Waiting until a condition is met</caption>
 *  import { actorCalled, Wait } from '@serenity-js/core';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *  import { Text } from '@serenity-js/web';
 *  import { equals } from '@serenity-js/assertions';
 *
 *  await actorCalled('Wendy')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Wait.until(Text.of(App.status), equals('Ready!')),
 *          // app is ready, proceed with the scenario
 *      );
 *
 *  // `Wait.until` makes the Actor keep asking a Question,
 *  // in this case Text.of(App.status), until the answer meets
 *  // the expectation, or a timeout expires (default: 5s).
 *  //
 *  // Please note that both Ensure and Wait can be used with
 *  // the same expectations, like `equals` or `includes`.
 *
 * @example <caption>Changing the default timeout</caption>
 *  import { actorCalled, Duration, Wait } from '@serenity-js/core';
 *  import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
 *  import { Text } from '@serenity-js/web';
 *  import { equals } from '@serenity-js/assertions';
 *  import { Browser, chromium } from 'playwright';
 *
 *  const browser: Browser = await chromium.launch({
 *      headless: true
 *  });
 *
 *  await actorCalled('Polly')
 *      .whoCan(BrowseTheWebWithPlaywright.using(browser))
 *      .attemptsTo(
 *          Wait.upTo(Duration.ofSeconds(3))
 *              .until(Text.of(App.status), equals('Ready!')),
 *          // app is ready, proceed with the scenario
 *      );
 *
 * @see {@link Duration}
 * @see {@link Interaction}
 */
export class Wait {

    /**
     * @desc
     *  Default timeout of 5 seconds used with {@link Wait.until}.
     *
     * @type {Duration}
     */
    static readonly Default_Timeout = Duration.ofSeconds(5);

    /**
     * @desc
     *  Default interval of 500ms between condition checks used with {@link Wait.until}.
     *
     * @type {Duration}
     */
    static readonly Default_Interval = Duration.ofMilliseconds(500);

    /**
     * @desc
     *  Instantiates a version of this {@link Interaction}
     *  configured to wait for a set duration.
     *
     * @param {Answerable<Duration>} duration
     *  A set duration the {@link Actor} should wait for before proceeding.
     *
     * @returns {Interaction}
     */
    static for(duration: Answerable<Duration>): Interaction {
        return new WaitFor(duration);
    }

    /**
     * @desc
     *  Instantiates a version of this {@link Interaction}
     *  configured to wait until the answer to the question (`actual`) meets the `expectation`,
     *  or a custom timeout expires.
     *
     * @param {Duration} duration
     *  Custom timeout to override {@link Wait.Default_Timeout}
     *
     * @returns {WaitBuilder}
     */
    static upTo(duration: Duration): WaitBuilder {
        return {
            until: <Actual>(actual: Answerable<Actual>, expectation: Expectation<Actual>): WaitUntil<Actual> =>
                new WaitUntil(actual, expectation, duration, Wait.Default_Interval),
        };
    }

    /**
     * @desc
     *  Instantiates a version of this {@link Interaction} configured to
     *  poll every {@link Wait.Default_Interval} for the result of the provided
     *  question (`actual`) until it meets the `expectation`,
     *  or the {@link Wait.Default_Timeout} expires.
     *
     * @param {Answerable<Actual>} actual
     *  A {@link Question} that the {@link Actor} will keep asking until the answer meets
     *  the {@link Expectation} provided.
     *
     * @param {Expectation<Actual>} expectation
     *  An {@link Expectation} to be met before proceeding
     *
     * @returns {WaitUntil<Actual>}
     */
    static until<Actual>(actual: Answerable<Actual>, expectation: Expectation<Actual>): WaitUntil<Actual> {
        return new WaitUntil(actual, expectation, Wait.Default_Timeout, Wait.Default_Interval);
    }
}

/**
 * @package
 */
class WaitFor extends Interaction {
    constructor(private readonly duration: Answerable<Duration>) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link Actor} perform this {@link Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link UsesAbilities}
     * @see {@link AnswersQuestions}
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const duration = await actor.answer(this.duration);

        return new Promise((resolve, reject_) => {
            const timeout = setTimeout(() => {
                clearTimeout(timeout);
                resolve();
            }, duration.inMilliseconds());
        });
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return d`#actor waits for ${ this.duration }`;
    }
}

/**
 * @desc
 *  Instructs the {@link Actor} to wait before proceeding until a given {@link Expectation} is met.
 *
 * @see {@link Wait.until}
 */
export class WaitUntil<Actual> extends Interaction {
    constructor(
        private readonly actual: Answerable<Actual>,
        private readonly expectation: Expectation<Actual>,
        private readonly timeout: Duration,
        private readonly pollingInterval: Duration,
    ) {
        super();
    }

    /**
     * @desc
     *  Configure how often the {@link Actor} should check if the answer meets the expectation.
     *
     * @param {Duration} interval
     * @returns {Interaction}
     */
    pollingEvery(interval: Duration): Interaction {
        return new WaitUntil(this.actual, this.expectation, this.timeout, interval);
    }

    /**
     * @desc
     *  Makes the provided {@link Actor} perform this {@link Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link UsesAbilities}
     * @see {@link AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        let pollerId: NodeJS.Timeout,
            timeoutId: NodeJS.Timeout,
            expectationOutcome: ExpectationOutcome<any, Actual>,
            thrown: Error;

        const poll = (resolve: () => void, reject: (error: Error) => void) => async () => {
            clearTimeout(pollerId);

            try {
                expectationOutcome = await actor.answer(
                    this.expectation.isMetFor(this.actual)
                );

                if (expectationOutcome instanceof ExpectationMet) {
                    clearTimeout(timeoutId);
                    return resolve();
                }

                pollerId = setTimeout(poll(resolve, reject), this.pollingInterval.inMilliseconds());

            } catch (error) {
                clearTimeout(timeoutId);

                return reject(error);
            }
        }

        const poller = () => new Promise<void>((resolve, reject) => {
            poll(resolve, reject)();
        });

        const timeout = () =>
            new Promise((resolve, reject) => {
                timeoutId = setTimeout(() => {
                    clearTimeout(pollerId);
                    clearTimeout(timeoutId);

                    reject(new AssertionError(
                        d`Waited ${ this.timeout }, polling every ${ this.pollingInterval }, for ${ this.actual } to ${ this.expectation }`,
                        expectationOutcome?.expected,
                        expectationOutcome?.actual,
                        thrown
                    ));

                }, this.timeout.inMilliseconds())
            });

        return Promise.race([
            poller(),
            timeout(),
        ]) as Promise<void>;
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return d`#actor waits up to ${ this.timeout }, polling every ${ this.pollingInterval }, until ${ this.actual } does ${ this.expectation }`;
    }
}
