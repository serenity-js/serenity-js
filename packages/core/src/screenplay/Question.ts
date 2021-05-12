import { isMappable, Mappable } from '../io/collections';
import { AnswersQuestions, UsesAbilities } from './actor';
import { AnswerMappingFunction } from './questions/mappings';

/**
 * @desc
 *  Enables the {@link Actor} to query the system under test.
 *
 * @example <caption>A basic Question</caption>
 *  import { Actor, AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 *  import { Ensure, equals } from '@serenity-js/assertions'
 *
 *  const LastItemOf = <T>(list: T[]): Question<T> =>
 *      Question.about('last item from the list', (actor: AnswersQuestions & UsesAbilities) => {
 *          return list[list.length - 1];
 *      });
 *
 *  Actor.named('Quentin').attemptsTo(
 *      Ensure.that(LastItemFrom([1,2,3]), equals(3)),
 *  );
 *
 * @example <caption>A question using the Actor's Ability to do something</caption>
 *  import { AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 *  import { CallAnApi } from '@serenity-js/rest'
 *
 *  const TextOfLastResponseStatus = () =>
 *      Question.about<number>(`the text of the last response status`, actor => {
 *          return CallAnApi.as(actor).mapLastResponse(response => response.statusText);
 *      });
 *
 *  @example <caption>Mapping answers to other questions</caption>
 *  import { Actor, AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 *  import { CallAnApi, LastResponse } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const RequestWasSuccessful = () =>
 *      Question.about<number>(`the text of the last response status`, actor => {
 *          return LastResponse.status().answeredBy(actor) === 200;
 *      });
 *
 *  const actor = Actor.named('Quentin').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(GetRequest.to('/books/0-688-00230-7')),
 *      Ensure.that(RequestWasSuccessful(), isTrue()),
 *  );
 *
 * @see {@link Actor}
 * @see {@link Interaction}
 * @see {@link Ability}
 *
 * @abstract
 */
export abstract class Question<T> {

    /**
     * @param {string} subject
     *  The subject of this question
     *
     * @protected
     */
    protected constructor(protected subject: string) {
    }

    /**
     * @desc
     *  Factory method that simplifies the process of defining custom questions.
     *
     * @example
     *  const EnvVariable = (name: string) =>
     *      Question.about(`the ${ name } env variable`, actor => process.env[name])
     *
     * @static
     *
     * @param {string} description
     * @param {function(actor: AnswersQuestions & UsesAbilities): R} body
     *
     * @returns {Question<R>}
     */
    static about<R>(description: string, body: (actor: AnswersQuestions & UsesAbilities) => R): Question<R> {
        return new AnonymousQuestion<R>(description, body);
    }

    /**
     * @desc
     *  Checks if the value is a {@link Question}.
     *
     * @static
     *
     * @param {any} maybeQuestion
     *  The value to check
     *
     * @returns {boolean}
     */
    static isAQuestion<T>(maybeQuestion: unknown): maybeQuestion is Question<T> {
        return !! maybeQuestion && !! (maybeQuestion as any).answeredBy;
    }

    /**
     * @desc
     *  Describes the subject of this {@link Question}.
     *
     * @returns {string}
     */
    toString(): string {
        return this.subject;
    }

    /**
     * @desc
     *  Changes the description of this question's subject.
     *
     * @param {string} subject
     * @returns {Question<T>}
     */
    describedAs(subject: string): this {
        this.subject = subject;

        return this;
    }

    /**
     * @desc
     *  Creates a new {@link Question}, which value is a result of applying the `mapping`
     *  function to the value of this {@link Question}.
     *
     * @example <caption>Mapping a Question<Promise<string>> to Question<Promise<number>></caption>
     *  import { Question, replace, toNumber } from '@serenity-js/core';
     *
     *  Question.about('the price of some item', actor => '$3.99')
     *      .map(replace('$', ''))
     *      .map(toNumber)
     *
     *  // => Question<Promise<number>>
     *  //      3.99
     *
     * @example <caption>Mapping all items of Question<string[]> to Question<Promise<number>></caption>
     *  import { Question, trim } from '@serenity-js/core';
     *
     *  Question.about('things to do', actor => [ ' walk the dog  ', '  read a book  ' ])
     *      .map(trim())
     *
     *  // => Question<Promise<string[]>>
     *  //      [ 'walk the dog', 'read a book' ]
     *
     * @example <caption>Using a custom mapping function</caption>
     *  import { Question } from '@serenity-js/core';
     *
     *  Question.about('normalised percentages', actor => [ 0.1, 0.3, 0.6 ])
     *      .map((actor: AnswersQuestions) => (value: number) => value * 100)
     *
     *  // => Question<Promise<number[]>>
     *  //      [ 10, 30, 60 ]
     *
     * @example <caption>Extracting values from LastResponse.body()</caption>
     *  import { Question } from '@serenity-js/core';
     *  import { LastResponse } from '@serenity-js/rest';
     *
     *  interface UserDetails {
     *      id: number;
     *      name: string;
     *  }
     *
     *  LastResponse.body<UserDetails>().map(actor => details => details.id)
     *
     *  // => Question<number>
     *
     * @param {function(value: A, index?: number): Promise<O> | O} mapping
     *  A mapping function that receives a value of type `<A>`, which is either:
     *  - an answer to the original question, if the question is defined as `Question<Promise<A>>` or `Question<A>`
     *  - or, if the question is defined as `Question<Promise<Mappable<A>>`, `Question<Mappable<A>>` - each item of the {@link Mappable} collection,
     *
     * @returns {Question<Promise<Mapped>>}
     *  A new Question which value is a result of applying the `mapping` function
     *  to the value of the current question, so that:
     *  - if the answer to the current question is a `Mappable<A>`, the result becomes `Question<Promise<O[]>>`
     *  - if the answer is a value `<A>` or `Promise<A>`, the result becomes `Question<Promise<O>>`
     *
     * @see {@link AnswerMappingFunction}
     * @see {@link Mappable}
     */
    map<O>(mapping: AnswerMappingFunction<AnswerOrItemOfMappableCollection<T>, O>): Question<Promise<Mapped<T, O>>> {
        return Question.about(this.subject, actor =>
            actor.answer(this).then(value =>
                (isMappable(value)
                    ? Promise.all(((value).map(mapping(actor)) as Array<PromiseLike<O> | O>))
                    : mapping(actor)(value as AnswerOrItemOfMappableCollection<T>)
                ) as Promise<Mapped<T, O>>
            )
        ) as Question<Promise<Mapped<T, O>>>;
    }

    /**
     * @abstract
     */
    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): T;
}

/**
 * @package
 */
type AnswerOrItemOfMappableCollection<V> =
    V extends PromiseLike<infer PromisedValue>
        ? PromisedValue extends Mappable<infer Item>
            ? Item
            : PromisedValue
        : V extends Mappable<infer Item>
            ? Item
            : V;

/**
 * @package
 */
type Mapped<T, O> =
    T extends PromiseLike<infer PromisedValue>
        ? PromisedValue extends Mappable<infer Item>        // eslint-disable-line @typescript-eslint/no-unused-vars
            ? O[]
            : O
        : T extends Mappable<infer Item>                    // eslint-disable-line @typescript-eslint/no-unused-vars
            ? O[]
            : O

/**
 * @package
 */
class AnonymousQuestion<T> extends Question<T> {
    constructor(private description: string, private body: (actor: AnswersQuestions & UsesAbilities) => T) {
        super(description);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities) {
        return this.body(actor);
    }

    /**
     * Changes the description of this question's subject
     * and produces a new instance without mutating the original one.
     *
     * @param {string} subject
     * @returns {Question<T>}
     */
    describedAs(subject: string): this {
        this.subject = subject;

        return this;
    }
}
