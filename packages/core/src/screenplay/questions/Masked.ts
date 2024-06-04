import type { UsesAbilities } from '../abilities';
import { type Answerable } from '../Answerable';
import { Question } from '../Question';
import type { AnswersQuestions } from './AnswersQuestions';

/**
 * This question masks sensitive data handled by the actors and prevents
 * it from being shown in Serenity/JS reports and console logs.
 * You should use it to wrap passwords, secret tokens, phone numbers,
 * credit card numbers, or any other personally identifiable information (PII).
 * However, even though the wrapped value is masked in the output,
 * you can still retrieve the unmasked value by making the actor answer
 * the question in your custom interactions.
 *
 * @group Questions
 */
export class Masked extends Question<Promise<string>> {

    // private subject: string;

    private constructor(private readonly value: Answerable<string>) {
        super(`[MASKED]`);
        // this.subject = `[MASKED]`;
    }

    // toString(): string {
    //     return this.subject;
    // }

    // describedAs(subject: string): this {
    //     this.subject = subject;
    //     return this;
    // }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return actor.answer(this.value);
    }

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
     *     Enter.theValue(Masked.valueOf('your little secret')).into(Form.exampleInput())
     *   );
     * ```
     *
     * @param parameter - An {@link Answerable} representing the masked value.
     * @returns A {@link QuestionAdapter} representing the masked value.
     */
    static valueOf(parameter: Answerable<string>): Question<Promise<string>> {
        return new Masked(parameter);
    }
}
