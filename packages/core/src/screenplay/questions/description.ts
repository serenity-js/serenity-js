import { asyncMap, isPlainObject } from '../../io';
import type { UsesAbilities } from '../abilities';
import type { DescribesActivities } from '../activities';
import type { Answerable } from '../Answerable';
import type { QuestionAdapter } from '../Question';
import { Question } from '../Question';
import type { AnswersQuestions } from './AnswersQuestions';
import type { DescriptionOptions } from './descriptions';
import { descriptionText, templateToString } from './descriptionText';

/**
 * Creates a single-line description of an {@apilink Activity} by transforming a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates),
 * parameterised with [primitive data types](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), [complex data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects),
 * or any {@apilink Answerable|Answerables} resolving to those, into a {@link QuestionAdapter|`QuestionAdapter<string>`} that can be used with {@apilink Task.where} and {@apilink Interaction.where}.
 *
 * For brevity, you can use the alias [`the`](/api/core/function/the/) instead of `description`.
 *
 * ## Parameterising `description` with primitive data types
 *
 * When `description` is parameterised with primitive data types, it behaves similarly to a regular template literal and produces a {@apilink Question} that resolves to a string with the interpolated values.
 *
 * ```ts
 * import { actorCalled, description, Task } from '@serenity-js/core'
 *
 * const providePhoneNumber = (phoneNumber: Answerable<string>) =>
 *  Task.where(description `#actor provides phone number: ${ phoneNumber }`, /* *\/)
 *
 * await actorCalled('Alice').attemptsTo(
 *   providePhoneNumber('(555) 123-4567'),
 *      // produces a Task described as: 'Alice provides phone number: (555) 123-4567'
 * )
 * ```
 *
 * ## Using `the` for brevity and improved readability
 *
 * If you find `description` to be too verbose, you can replace it with [`the`](/api/core/function/the/), which is an alias for `description`.
 *
 * ```ts
 * import { actorCalled, Task, the } from '@serenity-js/core'
 *
 * const providePhoneNumber = (phoneNumber: Answerable<string>) =>
 *  Task.where(the`#actor provides phone number: ${ phoneNumber }`, /* *\/)
 *
 * await actorCalled('Alice').attemptsTo(
 *   providePhoneNumber('(555) 123-4567'),
 *      // produces a Task described as: 'Alice provides phone number: (555) 123-4567'
 * )
 * ```
 *
 * ## Configuring the output
 *
 * You can configure the output of `description` by using {@apilink DescriptionOptions}:
 *
 * ```ts
 * import { actorCalled, Task, the } from '@serenity-js/core'
 *
 * const providePhoneNumber = (phoneNumber: Answerable<string>) =>
 *  Task.where(description({ maxLength: 10 }) `#actor provides phone number: ${ phoneNumber }`, /* *\/)
 *
 * await actorCalled('Alice').attemptsTo(
 *   providePhoneNumber('(555) 123-4567'),
 *      // produces a Task described as: 'Alice provides phone number: (555) 123-...'
 * )
 * ```
 *
 * ## Parameterising `description` with Questions
 *
 * When `description` is parameterised with {@apilink Question|Questions} or any other {@link Answerable|Answerables}, their values are resolves by an {@apilink Actor} performing the given {@apilink Activity},
 * are interpolated into the resulting string.
 *
 * ```ts
 * import { actorCalled, description, Task } from '@serenity-js/core'
 *
 * interface MyNotes {
 *   phoneNumber: string;
 * }
 *
 * const providePhoneNumber = (phoneNumber: Answerable<string>) =>
 *  Task.where(description `#actor provides phone number: ${ phoneNumber }`, /* *\/)
 *
 * await actorCalled('Alice').attemptsTo(
 *   notes<MyNotes>().set('phoneNumber', '(555) 123-4567'),
 *   providePhoneNumber(notes<MyNotes>().get('phoneNumber')),
 *      // produces a Task described as: 'Alice provides phone number: (555) 123-4567'
 * )
 * ```
 *
 * ## Parameterising `description` using objects with a custom `toString` method
 *
 * When `description` is parameterised with objects that have a custom [`toString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)
 * method, or {@link Answerable|Answerables} resolving to such objects, the `toString()` method is called to produce the resulting string.
 *
 * ```ts
 * import { actorCalled, description, Task } from '@serenity-js/core'
 *
 * class PhoneNumber {
 *   constructor(
 *     private readonly areaCode: string,
 *     private readonly centralOfficeCode: string,
 *     private readonly lineNumber: string,
 *   ) {}
 *
 *   toString() {
 *     return `(${ this.areaCode }) ${ this.centralOfficeCode }-${ this.lineNumber }`
 *   }
 * }
 *
 * const providePhoneNumber = (phoneNumber: Answerable<PhoneNumber>) =>
 *  Task.where(description `#actor provides phone number: ${ phoneNumber }`, /* *\/)
 *
 * await actorCalled('Alice').attemptsTo(
 *   providePhoneNumber(new PhoneNumber('555', '123', '4567')),
 *      // produces a Task described as: 'Alice provides phone number: (555) 123-4567'
 * )
 * ```
 *
 * ## Using with objects without a custom toString method
 *
 * When `description` is parameterised with complex objects that don't have a custom `toString()` method, or {@link Answerable}s resolving to such objects,
 * the resulting string will contain a JSON-like string representation of the object.
 *
 * ```ts
 * import { actorCalled, description, Task } from '@serenity-js/core'
 *
 * interface PhoneNumber {
 *   areaCode: string;
 *   centralOfficeCode: string;
 *   lineNumber: string;
 * }
 *
 * const providePhoneNumber = (phoneNumber: Answerable<PhoneNumber>) =>
 *  Task.where(description `#actor provides phone number: ${ phoneNumber }`, /* *\/)
 *
 * await actorCalled('Alice').attemptsTo(
 *   providePhoneNumber({ areaCode: '555', centralOfficeCode: '123', lineNumber: '4567' }),
 *      // produces a Task described as: 'Alice provides phone number: { areaCode: "555", centralOfficeCode: "123", lineNumber: "4567" }'
 * )
 * ```
 *
 * ## Using with masked values
 *
 * When `description` is parameterised with {@apilink Masked} values,
 * the resulting string will contain a masked representation of the values.
 *
 * ```ts
 * import { actorCalled, description, Task } from '@serenity-js/core'
 *
 * const providePhoneNumber = (phoneNumber: Answerable<string>) =>
 *  Task.where(description `#actor provides phone number: ${ phoneNumber }`, /* *\/)
 *
 * await actorCalled('Alice').attemptsTo(
 *   providePhoneNumber(Masked.valueOf('(555) 123-4567')),
 *      // produces a Task described as: 'Alice provides phone number: [MASKED]'
 * )
 * ```
 *
 * ## Learn more
 *
 * - {@apilink Answerable}
 * - {@apilink Question}
 * - {@apilink Question.describedAs}
 * - {@apilink QuestionAdapter}
 *
 * @group Questions
 */
export function description(options: DescriptionOptions): (templates: TemplateStringsArray, ...placeholders: Array<Answerable<any>>) => QuestionAdapter<string>
export function description(templates: TemplateStringsArray, ...parameters: Array<Answerable<any>>): QuestionAdapter<string>
export function description(...args: any[]): any {
    return isPlainObject(args[0])
        ? (templates: TemplateStringsArray, ...parameters: Array<Answerable<any>>) =>
            templateToQuestion(templates, parameters, args[0])
        : templateToQuestion(args[0], args.slice(1), { maxLength: 150 });
}

/**
 * Convenience alias for [`description`](/api/core/function/description/)
 *
 * ## Using `the` to describe an Activity
 *
 * Just like [`description`](/api/core/function/description/), `the` can be used to create a single-line description of an {@apilink Activity} by transforming a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates)
 * parameterised with [primitive data types](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), [complex data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects),
 * or any {@apilink Answerable|Answerables} resolving to those.
 *
 * ```ts
 * import { actorCalled, Task, the } from '@serenity-js/core'
 *
 * const providePhoneNumber = (phoneNumber: Answerable<string>) =>
 *  Task.where(the`#actor provides phone number: ${ phoneNumber }`, /* *\/)
 *
 * await actorCalled('Alice').attemptsTo(
 *   providePhoneNumber('(555) 123-4567'),
 *      // produces a Task described as: 'Alice provides phone number: (555) 123-4567'
 * )
 * ```
 *
 * @group Questions
 */
export const the = description;

function templateToQuestion(templates: TemplateStringsArray, parameters: Array<Answerable<any>>, options: DescriptionOptions): QuestionAdapter<string> {
    const description = descriptionText(options)(templates, ...parameters);

    return Question.about<string>(description, async (actor: AnswersQuestions & UsesAbilities & DescribesActivities) => {
        const descriptions = await asyncMap(parameters, parameter => actor.describe(parameter));
        const result = templateToString(templates, descriptions);

        return result;
    }); //.describedAs(Question.value<string>());
}
