import { ErrorSerialiser } from '../../errors';
import { d } from '../../io';
import { stringified } from '../../io/stringified';
import { LogEntry, Name } from '../../model';
import type { UsesAbilities } from '../abilities';
import type { Answerable } from '../Answerable';
import type { Answered } from '../Answered';
import type { CollectsArtifacts } from '../artifacts';
import { Interaction } from '../Interaction';
import type { AnswersQuestions } from '../questions';
import type { DebuggingResult } from './DebuggingResult';

/**
 * Instructs the {@apilink Actor|actor} to evaluate and {@apilink Log|log} the provided {@apilink Answerable|answerable} values.
 *
 * Since this interaction **accepts a callback function** that receives the evaluated results,
 * the best way to use it is while **running the test scenario via a Node.js debugger**.
 * See the links below to learn how to do it in popular IDEs.
 *
 * ## Debugging Answerable values
 *
 * {@apilink Debug.values} accepts a callback function that receives an array of {@apilink DebuggingResult} objects,
 * as well as the result of evaluating each provided {@apilink Answerable|answerable} with {@apilink Actor.answer}.
 *
 * ```typescript
 * import { actorCalled, Debug } from '@serenity-js/core'
 * import { Navigate, Page } from '@serenity-js/web'
 *
 * // Running the below through the Node.js debugger makes the actor resolve the provided values
 * // and return them to the debugger function, where you can investigate their contents,
 * // or inspect any Errors the evaluation has resulted with.
 * await actorCalled('Debbie').attemptsTo(
 *     Navigate.to('http://example.org'),
 *     Debug.values((results, title, url) => {
 *         // set a breakpoint here to view `results`, `title` and `url` in your IDE debugger
 *     }, Page.current().title(), Page.current().url()), // accepts multiple values
 * );
 * ```
 *
 * ## Accessing Playwright Page
 *
 * [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
 * provides features that allow for [experimenting with web UI locators](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright#tune-locators)
 * while the test is paused at breakpoint.
 *
 * Since this functionality is specific to [Playwright](/api/playwright), you can use it by passing {@apilink PlaywrightPage.current|`PlaywrightPage.current().nativePage()`}
 * to Serenity/JS {@apilink Debug.values}. Also make sure to name the evaluated value `page`, as this is the variable name that the Playwright VSCode extension expects.
 *
 * ```typescript
 * import { actorCalled, Debug } from '@serenity-js/core'
 * import { PlaywrightPage } from '@serenity-js/playwright'
 *
 * // Running the below through the Node.js debugger makes the actor resolve the provided values
 * // and return them to the debugger function, where you can investigate their contents,
 * // or inspect any Errors the evaluation has resulted with.
 * await actorCalled('Debbie').attemptsTo(
 *     Navigate.to('http://example.org'),
 *     Debug.values((results, page) => {
 *         // set a breakpoint here to use Playwright locator debugging features
 *         page.locator('.example-css-class')
 *         // note that you can change this selector while having the test paused at breakpoint
 *     }, PlaywrightPage.current().nativePage()),
 * );
 * ```
 *
 * ## Learn more
 * - [Node.js debugging - Getting started](https://nodejs.org/en/docs/guides/debugging-getting-started/)
 * - [Node.js debugging in VS Code](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
 * - [Running and debugging Node.js in WebStorm](https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html)
 * - [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
 *
 * @group Activities
 */
export class Debug<Values extends Array<Answerable<unknown>>> extends Interaction {

    /**
     * Instructs the {@apilink Actor|actor} to evaluate the provided `values`,
     * log the results, and then pass them to your `debuggerFunction`.
     *
     * To use this interaction, run your test scenario in the Node.js debugger
     * and set a breakpoint inside the `debuggerFunction`.
     *
     * @param debuggerFunction
     * @param values
     */
    static values<Values extends Array<Answerable<unknown>>>(debuggerFunction: (
        results: { [ Index in keyof Values ]: DebuggingResult<Values[Index]> },
        ...answers: { [ Index in keyof Values ]: Answered<Values[Index]> }
    ) => Promise<void> | void, ...values: Values): Interaction {
        return new Debug<Values>(
            `#actor debugs ${ values.length } values`,
            debuggerFunction,
            values
        );
    }

    /**
     * @param description
     *  Description of this interaction
     *
     * @param debuggerFunction
     *  Callback function to receive the results of debugging
     *
     * @param values
     *  Value to be evaluated by the actor, and provided to debuggerFunction
     */
    protected constructor(
        description: string,
        private readonly debuggerFunction: (
            debuggingResults: { [ Index in keyof Values ]: DebuggingResult<Values[Index]> },
            ...args: { [ Index in keyof Values ]: Answered<Values[Index]> }
        ) => Promise<void> | void,
        private readonly values: Values,
    ) {
        super(description);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): Promise<void> {

        const results = [] as { [ Index in keyof Values ]: DebuggingResult<Values[Index]> };

        for (const value of this.values) {

            const result: DebuggingResult<unknown> = {
                description: d`${ value }`,
                value: undefined,
                error: undefined,
            };

            try {
                result.value = await actor.answer(value);
            }
            catch (error) {
                result.error = error;
            }

            actor.collect(
                LogEntry.fromJSON({
                    data: JSON.stringify({
                        value: stringified(result.value),
                        error: result.error
                            ? ErrorSerialiser.serialise(result.error)
                            : result.error
                    }),
                }),
                new Name(result.description)
            );

            results.push(result);
        }

        this.debuggerFunction(
            results,
            ...results.map(result => result.value) as { [ Index in keyof Values ]: Answered<Values[Index]> }
        );
    }
}
