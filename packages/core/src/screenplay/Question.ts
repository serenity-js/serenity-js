import { f } from '../io';
import { AnswersQuestions, UsesAbilities } from './actor';
import { Answerable } from './Answerable';
import { Interaction } from './Interaction';
import { Optional } from './Optional';

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
    static about<R>(description: string, body: (actor: AnswersQuestions & UsesAbilities) => Promise<R> | R): QuestionAdapter<Awaited<R>> {
        return Question.createAdapter(new QuestionStatement(description, body));
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

    protected static createAdapter<AT>(statement: Question<AT>): QuestionAdapter<Awaited<AT>> {
        return new Proxy<() => Question<AT>, QuestionStatement<AT>>(() => statement, {

            get(currentStatement: () => Question<AT>, key: string | symbol, receiver: any) {
                const target = currentStatement();

                if (key === Symbol.toPrimitive) {
                    return (_hint: 'number' | 'string' | 'default') => {
                        return target.toString();
                    }
                }

                if (key in target) {
                    return Reflect.get(target, key)
                }

                if (key === 'then') {
                    return;
                }

                const originalSubject = f`${ target }`;

                const fieldDescription = (typeof key === 'number' || /^\d+$/.test(String(key)))
                    ? `[${ String(key) }]`  // array index
                    : `.${ String(key) }`;  // field/method name

                return Question.about(`${ originalSubject }${ fieldDescription }`, async (actor: AnswersQuestions & UsesAbilities) => {
                    const answer = await actor.answer(target as Answerable<AT>);

                    if (! isDefined(answer)) {
                        return undefined;       // eslint-disable-line unicorn/no-useless-undefined
                    }

                    const field = answer[key];

                    return typeof field === 'function'
                        ? field.bind(answer)
                        : field;
                })
            },

            set(currentStatement: () => Question<AT>, key: string | symbol, value: any, receiver: any): boolean {
                const target = currentStatement();

                return Reflect.set(target, key, value);
            },

            apply(currentStatement: () => Question<AT>, _thisArgument: any, parameters: unknown[]): QuestionAdapter<AT> {

                const target = currentStatement();

                const parameterDescriptions = [
                    '(',
                    parameters.map(p => f`${ p }`).join(', '),
                    ')'
                ].join('');

                return Question.about(target.toString() + parameterDescriptions, async actor => {
                    const params = [] as any;
                    for (const parameter of parameters) {
                        const answered = await actor.answer(parameter);
                        params.push(answered);
                    }

                    const field = await actor.answer(target);

                    return typeof field === 'function'
                        ? field(...params)
                        : field;
                });
            },

            getPrototypeOf(currentStatement: () => Question<AT>): object | null {
                return Reflect.getPrototypeOf(currentStatement());
            },
        }) as any;
    }

    /**
     * @desc
     *  Describes the subject of this {@link Question}.
     *
     * @returns {string}
     */
    abstract toString(): string;

    /**
     * @desc
     *  Changes the description of this question's subject.
     *
     * @param {string} subject
     * @returns {Question<T>}
     */
    abstract describedAs(subject: string): this;

    /**
     * @abstract
     */
    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): T;

    public as<O>(mapping: (answer: Awaited<T>) => Promise<O> | O): QuestionAdapter<O> {
        return Question.about<O>(f`${ this }.as(${ mapping })`, async actor => {
            const answer = (await actor.answer(this)) as Awaited<T>;
            return mapping(answer);
        });
    }
}

declare global  {
    interface ProxyConstructor {
        new <Source_Type extends object, Target_Type extends object>(target: Source_Type, handler: ProxyHandler<Source_Type>): Target_Type;
    }
}

/* eslint-disable @typescript-eslint/indent */
export type ProxiedAnswer<Original_Type> = {
    [Field in keyof Omit<Original_Type, keyof QuestionStatement<Original_Type>>]:
        // is it a method?
        Original_Type[Field] extends (...args: infer OriginalParameters) => infer OriginalMethodResult
            // make the method signature asynchronous, accepting Answerables and returning a Promise
            ? (...args: { [P in keyof OriginalParameters]: Answerable<OriginalParameters[P]> }) =>
                { isPresent(): Question<Promise<boolean>> } & QuestionAdapter<Awaited<OriginalMethodResult>>
            // is it an object? wrap each field
            : { isPresent(): Question<Promise<boolean>> } & QuestionAdapter<Awaited<Original_Type[Field]>>
};
/* eslint-enable @typescript-eslint/indent */

export type QuestionAdapter<Original_Type> =
    Question<Promise<Original_Type>> &
    Interaction &
    Optional &
    ProxiedAnswer<Original_Type>;

class QuestionStatement<Answer_Type> extends Interaction implements Question<Promise<Answer_Type>>, Optional {

    constructor(
        private subject: string,
        private readonly body: (actor: AnswersQuestions & UsesAbilities, ...Parameters) => Promise<Answer_Type> | Answer_Type,
    ) {
        super();
    }

    /**
     * @desc
     *  Returns a Question that resolves to `true` if resolving the {@link QuestionStatement}
     *  returns a value other than `null` or `undefined` and doesn't throw errors.
     *
     * @returns {Question<Promise<boolean>>}
     */
    isPresent(): Question<Promise<boolean>> {
        return new IsPresent(f`${ this }.isPresent()`, this.body);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Answer_Type> {
        const result = await this.body(actor);

        return isDefined(result)
            ? result
            : undefined;
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        await this.body(actor);
    }

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject;
    }

    as<O>(mapping: (answer: Awaited<Answer_Type>) => (Promise<O> | O)): QuestionAdapter<O>{
        return Question.about<O>(f`${ this }.as(${ mapping })`, async actor => {
            const answer = await actor.answer(this);

            if (! isDefined(answer)) {
                return undefined;   // eslint-disable-line unicorn/no-useless-undefined
            }

            return mapping(answer);
        });
    }
}

/**
 * @package
 */
class IsPresent<T> extends Question<Promise<boolean>> {

    constructor(
        private subject: string,
        private readonly body: (actor: AnswersQuestions & UsesAbilities) => T,
    ) {
        super();
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<boolean> {
        try  {
            const answer = await this.body(actor);

            if (answer === undefined || answer === null) {
                return false;
            }

            if (this.isOptional(answer)) {
                return await actor.answer(answer.isPresent());
            }

            return true;
        } catch {
            return false;
        }
    }

    private isOptional(maybeOptional: any): maybeOptional is Optional {
        return typeof maybeOptional === 'object'
            && Reflect.has(maybeOptional, 'isPresent');
    }

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject;
    }
}

/**
 * @package
 */
function isDefined<T>(value: T): boolean {
    return value !== undefined
        && value !== null;
}
