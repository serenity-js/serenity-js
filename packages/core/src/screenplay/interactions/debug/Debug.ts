import { d, ErrorSerialiser } from '../../../io';
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
 * @desc
 *  Instructs the {@link Actor} to set a breakpoint and optionally evaluate and log the provided {@link Answerable} values.
 *
 *  Since this interaction sets a breakpoint using the [`debugger`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) statement,
 *  the best way to use it is while running the test scenario via a Node.js debugger.
 *
 * @example <caption>Setting a breakpoint to pause the scenario</caption>
 *  import { actorCalled, Debug } from '@serenity-js/core';
 *  import { Navigate } from '@serenity-js/web';
 *
 *  await actorCalled('Debbie').attemptsTo(
 *      Navigate.to('http://example.org'),
 *      Debug.setBreakpoint(),
 *      // ... other activities
 *  );
 *
 * @example <caption>Debugging Answerable values</caption>
 *  import { actorCalled, Debug } from '@serenity-js/core';
 *  import { Navigate, Page } from '@serenity-js/web';
 *
 *  // Running the below through the Node.js debugger makes the actor resolve the provided values
 *  // and return them to the debugger function, where you can investigate their contents,
 *  // or inspect any Errors the evaluation has resulted with.
 *  await actorCalled('Debbie').attemptsTo(
 *      Navigate.to('http://example.org'),
 *      Debug.values(Page.current().title(), Page.current().url()), // accepts multiple values
 *  );
 *
 * @extends {Interaction}
 */
export class Debug<Values extends Array<Answerable<unknown>>> extends Interaction {

    /**
     * @desc
     *  Invokes a debugger function that sets a breakpoint.
     *
     *   To use this interaction, run your test scenario in the Node.js debugger.
     *
     * @returns {Interaction}
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
     * @desc
     *  Instructs the Actor to evaluate the provided `values`,
     *  log the results, and then pass them to a debugger function.
     *
     *  To use this interaction, run your test scenario in the Node.js debugger.
     *
     * @param {...items: Array<Answerable<any>>} values
     *  The values to be debugged
     *
     * @returns {Interaction}
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
     * @param {string} description
     *  Description of this interaction
     * @param debuggerFunction
     *  Callback function to receive the results of debugging
     * @param {Array<Answerable<any>>} values
     *  Values to be evaluated by the actor, and provided to debuggerFunction
     */
    constructor(
        private readonly description: string,
        private readonly debuggerFunction: (args: { [ Index in keyof Values ]: DebuggingResult<Answered<Values[Index]>> }) => void,
        private readonly values: Values,
    ) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this {@link Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions & CollectsArtifacts} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link UsesAbilities}
     * @see {@link AnswersQuestions}
     * @see {@link CollectsArtifacts}
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

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return this.description;
    }
}
