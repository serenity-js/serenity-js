import { ErrorSerialiser } from '../../../errors';
import { d } from '../../../io';
import { inspected } from '../../../io/inspected';
import { LogEntry, Name } from '../../../model';
import { AnswersQuestions, CollectsArtifacts, UsesAbilities } from '../../actor';
import { Answerable } from '../../Answerable';
import { Answered } from '../../Answered';
import { Interaction } from '../../Interaction';
import { breakpoint } from './breakpoint';
import { DebuggingResult } from './DebuggingResult';
import { viewer } from './viewer';

/**
 * Instructs the {@apilink Actor} to set a breakpoint and optionally evaluate and log the provided {@apilink Answerable} values.
 *
 * Since this interaction sets a breakpoint using the [`debugger`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) statement,
 * the best way to use it is while running the test scenario via a Node.js debugger.
 * See the links below to learn how to do it in popular IDEs.
 *
 * ## Setting a breakpoint to pause the scenario
 *
 * Note that for setting the breakpoint to work you need to run your test scenario via a Node.js debugger.
 *
 * ```ts
 * import { actorCalled, Debug } from '@serenity-js/core'
 * import { Navigate } from '@serenity-js/web'
 *
 * await actorCalled('Debbie').attemptsTo(
 *   Navigate.to('http://example.org'),
 *   Debug.setBreakpoint(),
 *   // ... other activities
 * );
 * ```
 *
 * ## Debugging Answerable values
 *
 * ```ts
 * import { actorCalled, Debug } from '@serenity-js/core'
 * import { Navigate, Page } from '@serenity-js/web'
 *
 * // Running the below through the Node.js debugger makes the actor resolve the provided values
 * // and return them to the debugger function, where you can investigate their contents,
 * // or inspect any Errors the evaluation has resulted with.
 * await actorCalled('Debbie').attemptsTo(
 *   Navigate.to('http://example.org'),
 *   Debug.values(Page.current().title(), Page.current().url()), // accepts multiple values
 * );
 * ```
 *
 * ## Learn more
 * - [Node.js debugging - Getting started](https://nodejs.org/en/docs/guides/debugging-getting-started/)
 * - [Node.js debugging in VS Code](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
 * - [Running and debugging Node.js in WebStorm](https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html)
 *
 * @group Interactions
 */
export class Debug<Values extends Array<Answerable<unknown>>> extends Interaction {

    /**
     * Invokes a debugger function that sets a breakpoint.
     * To use this interaction, run your test scenario in the Node.js debugger.
     */
    static setBreakpoint(): Interaction {
        /* istanbul ignore next can't test using a debugger in an automated test */
        return new Debug<Array<Answerable<any>>>(
            `#actor sets a breakpoint`,
            breakpoint,
            []
        );
    }

    /**
     * Instructs the Actor to evaluate the provided `values`,
     * log the results, and then pass them to a debugger function.
     *
     * To use this interaction, run your test scenario in the Node.js debugger.
     *
     * @param values
     *  The values to be debugged
     */
    static values(...values: Array<Answerable<any>>): Interaction {
        /* istanbul ignore next can't test using a debugger in an automated test */
        return new Debug<Array<Answerable<any>>>(
            `#actor debugs ${ values.length } values`,
            viewer,
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
     *  Values to be evaluated by the actor, and provided to debuggerFunction
     */
    constructor(
        description: string,
        private readonly debuggerFunction: (args: { [ Index in keyof Values ]: DebuggingResult<Answered<Values[Index]>> }) => void,
        private readonly values: Values,
    ) {
        super(description);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): Promise<void> {
        const results = [] as { [ Index in keyof Values ]: DebuggingResult<Answered<Values[Index]>> };

        for (const value of this.values) {

            const result: DebuggingResult<unknown> = {
                description: d`${ value }`,
                value: undefined,
                error: undefined,
            }

            try {
                result.value = await actor.answer(value);
            }
            catch(error) {
                result.error = error;
            }

            actor.collect(
                LogEntry.fromJSON({
                    data: JSON.stringify({
                        value: inspected(result.value),
                        error: result.error ? ErrorSerialiser.serialise(result.error) : result.error
                    }),
                }),
                new Name(result.description)
            );

            results.push(result)
        }

        this.debuggerFunction(results);
    }
}
