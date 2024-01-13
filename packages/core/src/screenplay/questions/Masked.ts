import type { QuestionAdapter } from '..';
import { type Answerable,Question } from '..';

/**
 * This utility serves to manage sensitive data.
 * If an actor answers to this question, they gain access
 * to the unmasked value during runtime — such as a password or secret token. 
 * Any Serenity/JS reports will mask this value for security reasons.
 *
 * @group Questions
 */
export class Masked {
    
    /**
     * Retrieves the value of a sensitive parameter and mask it in any report.
     *
     * #### Example
     *
     * ```ts
     * import { actorCalled, Masked } from '@serenity-js/core';
     * import { Ensure, equals } from '@serenity-js/assertions';
     *
     * await actorCalled('John')
     *   .attemptsTo(
     *     Enter.theValue(Masked.valueOf('your little secret').into(Form.exampleInput())
     *   );
     * ```
     *
     * @param parameter - An {@link Answerable} representing the masked value.
     * @returns A {@link QuestionAdapter} representing the masked value.
     */
    static valueOf(parameter: Answerable<string>) :  QuestionAdapter<string> {
        return Question.about('[a masked value]', async actor => actor.answer(parameter))
    }
}