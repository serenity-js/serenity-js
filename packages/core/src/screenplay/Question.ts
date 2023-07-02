import { isRecord } from 'tiny-types/lib/objects';
import * as util from 'util'; // eslint-disable-line unicorn/import-style

import { LogicError } from '../errors';
import { f, inspectedObject } from '../io';
import { UsesAbilities } from './abilities';
import { Answerable } from './Answerable';
import { Interaction } from './Interaction';
import { Optional } from './Optional';
import { AnswersQuestions } from './questions/AnswersQuestions';
import { Unanswered } from './questions/Unanswered';
import { RecursivelyAnswered } from './RecursivelyAnswered';
import { WithAnswerableProperties } from './WithAnswerableProperties';

/**
 * **Questions** describe how {@apilink Actor|actors} should query the system under test or the test environment to retrieve some information.
 *
 * Questions are the core building block of the [Screenplay Pattern](/handbook/design/screenplay-pattern),
 * along with {@apilink Actor|Actors}, {@apilink Ability|Abilities}, {@apilink Interaction|Interactions}, and {@apilink Task|Tasks}.
 *
 * ![Screenplay Pattern](/images/design/serenity-js-screenplay-pattern.png)
 *
 * Learn more about:
 * - {@apilink Actor}
 * - {@apilink Ability|Abilities}
 * - {@apilink Interaction}
 * - {@apilink QuestionAdapter}
 *
 * ## Implementing a basic custom Question
 *
 * ```ts
 *  import { actorCalled, AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 *  import { Ensure, equals } from '@serenity-js/assertions'
 *
 *  const LastItemOf = <T>(list: T[]): Question<T> =>
 *    Question.about('last item from the list', (actor: AnswersQuestions & UsesAbilities) => {
 *      return list[list.length - 1]
 *    });
 *
 *  await actorCalled('Quentin').attemptsTo(
 *    Ensure.that(LastItemFrom([1,2,3]), equals(3)),
 *  )
 * ```
 *
 * ## Implementing a Question that uses an Ability
 *
 * Just like the {@apilink Interaction|interactions}, a {@apilink Question}
 * also can use {@apilink Actor|actor's} {@apilink Ability|abilities}.
 *
 * Here, we use the ability to {@apilink CallAnApi} to retrieve a property of
 * an HTTP response.
 *
 * ```ts
 *  import { AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 *  import { CallAnApi } from '@serenity-js/rest'
 *
 *  const TextOfLastResponseStatus = () =>
 *    Question.about<number>(`the text of the last response status`, actor => {
 *      return CallAnApi.as(actor).mapLastResponse(response => response.statusText)
 *    })
 * ```
 *
 * #### Learn more
 * - {@apilink CallAnApi}
 * - {@apilink LastResponse}
 *
 * ## Mapping answers to other questions
 *
 * Apart from retrieving information, {@apilink Question|questions} can be used to transform information retrieved by other questions.
 *
 * Here, we use the factory method {@apilink Question.about} to produce a question that makes the received {@apilink Actor|actor}
 * answer {@apilink LastResponse.status} and then compare it against some expected value.
 *
 * ```ts
 * import { actorCalled, AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 * import { CallAnApi, LastResponse } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * const RequestWasSuccessful = () =>
 *   Question.about<number>(`the text of the last response status`, actor => {
 *     return LastResponse.status().answeredBy(actor) === 200;
 *   });
 *
 * await actorCalled('Quentin')
 *   .whoCan(CallAnApi.at('https://api.example.org/'));
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/books/0-688-00230-7')),
 *     Ensure.that(RequestWasSuccessful(), isTrue()),
 *   );
 * ```
 *
 * Note that the above example is for demonstration purposes only, Serenity/JS provides an easier way to
 * verify the response status of the {@apilink LastResponse}:
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, LastResponse } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Quentin')
 *   .whoCan(CallAnApi.at('https://api.example.org/'));
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/books/0-688-00230-7')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   );
 * ```
 *
 * @group Screenplay Pattern
 */
export abstract class Question<T> {

    /**
     * Factory method that simplifies the process of defining custom questions.
     *
     * #### Defining a custom question
     *
     * ```ts
     * import { Question } from '@serenity-js/core'
     *
     * const EnvVariable = (name: string) =>
     *   Question.about(`the ${ name } env variable`, actor => process.env[name])
     * ```
     *
     * @param description
     * @param body
     */
    static about<Result_Type>(description: string, body: (actor: AnswersQuestions & UsesAbilities) => Promise<Result_Type> | Result_Type): QuestionAdapter<Awaited<Result_Type>> {
        return Question.createAdapter(new QuestionStatement(description, body));
    }

    /**
     * Generates a {@apilink QuestionAdapter} that recursively resolves
     * any {@apilink Answerable} fields of the provided object,
     * including {@apilink Answerable} fields of {@apilink WithAnswerableProperties|nested objects}.
     *
     * Optionally, the method accepts `overrides` to be shallow-merged with the fields of the original `source`,
     * producing a new merged object.
     *
     * Overrides are applied from left to right, with subsequent objects overwriting property assignments of the previous ones.
     *
     * #### Resolving an object recursively using `Question.fromObject`
     *
     * ```ts
     * import { actorCalled, Question } from '@serenity-js/core'
     * import { Send, PostRequest } from '@serenity-js/rest'
     * import { By, Text, PageElement } from '@serenity-js/web'
     *
     * await actorCalled('Daisy')
     *   .whoCan(CallAnApi.at('https://api.example.org'))
     *   .attemptsTo(
     *     Send.a(
     *       PostRequest.to('/products/2')
     *         .with(
     *           Question.fromObject({
     *             name: Text.of(PageElement.located(By.css('.name'))),
     *           })
     *         )
     *       )
     *   );
     * ```
     *
     * #### Merging objects using `Question.fromObject`
     *
     * ```ts
     *  import { actorCalled, Question } from '@serenity-js/core'
     *  import { Send, PostRequest } from '@serenity-js/rest'
     *  import { By, Text, PageElement } from '@serenity-js/web'
     *
     *  await actorCalled('Daisy')
     *    .whoCan(CallAnApi.at('https://api.example.org'))
     *    .attemptsTo(
     *      Send.a(
     *        PostRequest.to('/products/2')
     *          .with(
     *            Question.fromObject({
     *              name: Text.of(PageElement.located(By.css('.name'))),
     *              quantity: undefined,
     *            }, {
     *              quantity: 2,
     *            })
     *          )
     *        )
     *    );
     *
     * @param source
     * @param overrides
     *
     * #### Learn more
     * - {@apilink WithAnswerableProperties}
     * - {@apilink RecursivelyAnswered}
     * - {@apilink Answerable}
     */
    static fromObject<Source_Type extends object>(
        source: Answerable<WithAnswerableProperties<Source_Type>>,
        ...overrides: Array<Answerable<Partial<WithAnswerableProperties<Source_Type>>>>
    ): QuestionAdapter<RecursivelyAnswered<Source_Type>> {
        return Question.about<RecursivelyAnswered<Source_Type>>('value', async actor => {
            if (source === null || source === undefined) {
                return source;
            }

            const sources: Array<Partial<RecursivelyAnswered<Source_Type>>> = [];

            for (const [ i, currentSource ] of [ source, ...overrides ].entries()) {
                sources.push(
                    await recursivelyAnswer(actor, currentSource as any, `argument ${ i }`) as unknown as Partial<RecursivelyAnswered<Source_Type>>,
                );
            }

            return Object.assign({}, ...sources);
        });
    }

    /**
     * Checks if the value is a {@apilink Question}.
     *
     * @param maybeQuestion
     *  The value to check
     */
    static isAQuestion<T>(maybeQuestion: unknown): maybeQuestion is Question<T> {
        return !! maybeQuestion
            && typeof (maybeQuestion as any).answeredBy === 'function';
    }

    protected static createAdapter<AT>(statement: Question<AT>): QuestionAdapter<Awaited<AT>> {
        function getStatement() {
            return statement;
        }

        if (typeof statement[util.inspect.custom] === 'function') {
            Object.defineProperty(
                // statement must be a function because Proxy apply trap works only with functions
                getStatement,
                util.inspect.custom, {
                    value: statement[util.inspect.custom].bind(statement),
                    writable: false,
                })
        }

        return new Proxy<() => Question<AT>, QuestionStatement<AT>>(getStatement, {

            get(currentStatement: () => Question<AT>, key: string | symbol, receiver: any) {
                const target = currentStatement();

                if (key === util.inspect.custom) {
                    return target[util.inspect.custom].bind(target);
                }

                if (key === Symbol.toPrimitive) {
                    return (_hint: 'number' | 'string' | 'default') => {
                        return target.toString();
                    };
                }

                if (key in target) {

                    const field = Reflect.get(target, key);

                    const isFunction = typeof field == 'function'
                    const mustAllowProxyChaining = isFunction
                        && target instanceof QuestionStatement
                        && key === 'describedAs';   // `describedAs` returns `this`, which must be bound to proxy itself to allow proxy chaining

                    if (mustAllowProxyChaining) {
                        // see https://javascript.info/proxy#proxy-limitations
                        return field.bind(receiver)
                    }

                    return isFunction
                        ? field.bind(target)
                        : field;
                }

                if (key === 'then') {
                    return;
                }

                return Question.about(Question.fieldDescription(target, key), async (actor: AnswersQuestions & UsesAbilities) => {
                    const answer = await actor.answer(target as Answerable<AT>);

                    if (!isDefined(answer)) {
                        return undefined;       // eslint-disable-line unicorn/no-useless-undefined
                    }

                    const field = answer[key];

                    return typeof field === 'function'
                        ? field.bind(answer)
                        : field;
                });
            },

            set(currentStatement: () => Question<AT>, key: string | symbol, value: any, receiver: any): boolean {
                const target = currentStatement();

                return Reflect.set(target, key, value);
            },

            apply(currentStatement: () => Question<AT>, _thisArgument: any, parameters: unknown[]): QuestionAdapter<AT> {
                const target = currentStatement();

                return Question.about(Question.methodDescription(target, parameters), async actor => {
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

    private static fieldDescription<AT>(target: Question<AT>, key: string | symbol): string {

        // "of" is characteristic of Serenity/JS MetaQuestion
        if (key === 'of') {
            return `${ target } ${ key }`;
        }

        const originalSubject = f`${ target }`;

        const fieldDescription = (typeof key === 'number' || /^\d+$/.test(String(key)))
            ? `[${ String(key) }]`  // array index
            : `.${ String(key) }`;  // field/method name

        return `${ originalSubject }${ fieldDescription }`;
    }

    private static methodDescription<AT>(target: Question<AT>, parameters: unknown[]): string {

        const targetDescription = target.toString();

        // this is a Serenity/JS MetaQuestion, of(singleParameter)
        if (targetDescription.endsWith(' of') && parameters.length === 1) {
            return `${ targetDescription } ${ parameters[0] }`;
        }

        const parameterDescriptions = [
            '(', parameters.map(p => f`${ p }`).join(', '), ')',
        ].join('');

        return `${ targetDescription }${ parameterDescriptions }`;
    }

    /**
     * Returns the description of the subject of this {@apilink Question}.
     */
    abstract toString(): string;

    /**
     * Changes the description of this question's subject.
     *
     * @param subject
     */
    abstract describedAs(subject: string): this;

    /**
     * Instructs the provided {@apilink Actor} to use their {@apilink Ability|abilities}
     * to answer this question.
     */
    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): T;

    /**
     * Maps this question to one of a different type.
     *
     * ```ts
     * Question.about('number returned as string', actor => '42')   // returns: QuestionAdapter<string>
     *   .as(Number)                                                // returns: QuestionAdapter<number>
     * ```
     *
     * @param mapping
     */
    public as<O>(mapping: (answer: Awaited<T>) => Promise<O> | O): QuestionAdapter<O> {
        return Question.about<O>(f`${ this }.as(${ mapping })`, async actor => {
            const answer = (await actor.answer(this)) as Awaited<T>;
            return mapping(answer);
        });
    }
}

declare global {
    interface ProxyConstructor {
        new<Source_Type extends object, Target_Type extends object>(target: Source_Type, handler: ProxyHandler<Source_Type>): Target_Type;
    }
}

/* eslint-disable @typescript-eslint/indent */

/**
 * Describes an object recursively wrapped in {@apilink QuestionAdapter} proxies, so that:
 * - both methods and fields of the wrapped object can be used as {@apilink Question|questions} or {@apilink Interactions|interactions}
 * - method parameters of the wrapped object will accept {@apilink Answerable|Answerable<T>}
 *
 * @group Questions
 */
export type QuestionAdapterFieldDecorator<Original_Type> = {
    [Field in keyof Omit<Original_Type, keyof QuestionStatement<Original_Type>>]:
    // is it a method?
    Original_Type[Field] extends (...args: infer OriginalParameters) => infer OriginalMethodResult
        // make the method signature asynchronous, accepting Answerables and returning a QuestionAdapter
        ? (...args: { [P in keyof OriginalParameters]: Answerable<Awaited<OriginalParameters[P]>> }) =>
            QuestionAdapter<Awaited<OriginalMethodResult>>
        // is it an object? wrap each field
        : Original_Type[Field] extends number | bigint | boolean | string | symbol | object
            ? QuestionAdapter<Awaited<Original_Type[Field]>>
            : any;
};
/* eslint-enable @typescript-eslint/indent */

/**
 * A union type representing a proxy object returned by {@apilink Question.about}.
 *
 * {@apilink QuestionAdapter} proxies the methods and fields of the wrapped object recursively,
 * allowing them to be used as either a {@apilink Question} or an {@apilink Interaction}.
 *
 * @group Questions
 */
export type QuestionAdapter<T> =
    & Question<Promise<T>>
    & Interaction
    & { isPresent(): Question<Promise<boolean>>; }  // more specialised Optional
    & QuestionAdapterFieldDecorator<T>;

/** @package */
class QuestionStatement<Answer_Type> extends Interaction implements Question<Promise<Answer_Type>>, Optional {

    private answer: Answer_Type | Unanswered = new Unanswered();

    constructor(
        private subject: string,
        private readonly body: (actor: AnswersQuestions & UsesAbilities, ...Parameters) => Promise<Answer_Type> | Answer_Type,
    ) {
        super(subject, QuestionStatement.callerLocation(4));
    }

    /**
     * Returns a Question that resolves to `true` if resolving the {@apilink QuestionStatement}
     * returns a value other than `null` or `undefined`, and doesn't throw errors.
     */
    isPresent(): Question<Promise<boolean>> {
        return new IsPresent(this);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Answer_Type> {
        this.answer = await this.body(actor);
        return this.answer;
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        await this.body(actor);
    }

    [util.inspect.custom](depth: number, options: util.InspectOptionsStylized, inspect: typeof util.inspect): string {
        return inspectedObject(this.answer)(depth, options, inspect);
    }

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    override toString(): string {
        return this.subject;
    }

    as<O>(mapping: (answer: Awaited<Answer_Type>) => (Promise<O> | O)): QuestionAdapter<O> {
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

    private subject: string;

    constructor(private readonly question: Question<T>) {
        super();
        this.subject = f`${question}.isPresent()`;
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<boolean> {
        try {
            const answer = await actor.answer(this.question);

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

/**
 * @package
 */
const maxRecursiveCallsLimit = 100;

/**
 * @package
 */
async function recursivelyAnswer<K extends number | string | symbol, V> (
    actor: AnswersQuestions & UsesAbilities,
    answerable: Answerable<Partial<Record<K, Answerable<V>>>>,
    description: string,
    currentRecursion = 0,
): Promise<Record<K, V>> {
    if (currentRecursion >= maxRecursiveCallsLimit) {
        throw new LogicError(`Question.fromObject() has reached the limit of ${ maxRecursiveCallsLimit } recursive calls while trying to resolve ${ description }. Could it contain cyclic references?`);
    }

    const answer = await actor.answer(answerable) as any;

    if (isRecord(answer)) {
        const entries = Object.entries(answer);
        const answeredEntries = [];

        for (const [ key, value ] of entries) {
            answeredEntries.push([ key, await recursivelyAnswer(actor, value as any, description, currentRecursion + 1) ]);
        }

        return Object.fromEntries(answeredEntries) as Record<K, V>;
    }

    if (Array.isArray(answer)) {
        const answeredEntries: Array<V> = [];

        for (const item of answer) {
            answeredEntries.push(await recursivelyAnswer(actor, item, description, currentRecursion + 1) as V);
        }

        return answeredEntries as unknown as Record<K, V>;
    }

    return answer as Record<K, V>;
}
