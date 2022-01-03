import { LogicError } from '../../errors';
import { inspected } from '../../io/inspected';
import { Actor, AnswersQuestions, UsesAbilities } from '../actor';
import { Interaction } from '../Interaction';
import { Question } from '../Question';
import { Adapter } from './Adapter';

export function createAdapter<A, Q extends Question<A> = Question<A>>(question: Q): Q & Adapter<Awaited<A>> {

    return new Proxy<Q>(question, {

        get(target: Q, key: string | symbol | number, receiver: any) {
            if (key === Symbol.toPrimitive) {
                return (_hint: 'number' | 'string' | 'default') => {
                    return target.toString();
                }
            }

            if (shouldReflect(target, key)) {
                return Reflect.get(target, key, receiver);
            }

            if (! shouldProxy(key)) { // ! shouldProxy
                return;
            }

            const fieldDescription = (typeof key === 'number' || /^\d+$/.test(String(key)))
                ? `[${ String(key) }]`  // array index
                : `.${ String(key) }`;  // field/method name

            // when property is invoked as a method
            function __serenityProxy(...originalParameters) {

                const parameterDescriptions = [
                    '(',
                    originalParameters.map(p => inspected(p, { inline: true, markQuestions: true })).join(', '),
                    ')'
                ].join('');

                const originalSubject = inspected(question, { inline: true, markQuestions: true });

                return createAdapter(new DynamicProp(originalSubject + fieldDescription + parameterDescriptions, async actor => {
                    // resolve the original answer
                    const answer = await actor.answer(target);

                    if (answer === undefined) {
                        throw new LogicError(`${ inspected(target, { inline: true, markQuestions: true }) } is undefined, can't read property '${ String(key) }'`);
                    }

                    if (typeof answer[key] !== 'function') {
                        throw new LogicError(`${ inspected(target, { inline: true, markQuestions: true }) } does not have a method called '${ String(key) }'`);
                    }

                    // convert parameters from Answerable<T> => T
                    const parameters = await (Promise.all(
                        originalParameters.map(parameter => {
                            return actor.answer(parameter)
                        })
                    ));

                    // invoke the method call on the original answer
                    return answer[key](...parameters)
                }));
            }

            const originalSubject = inspected(question, { inline: true, markQuestions: true });

            __serenityProxy.subject = originalSubject + fieldDescription

            // when property is accessed as a field
            const body = async (actor: Actor) => {
                const answer = await actor.answer(target);

                if (answer === undefined) {
                    throw new LogicError(`${ target } is undefined, can't read property "${ String(key) }"`);
                }

                return answer[key];
            };

            __serenityProxy.answeredBy = body;
            __serenityProxy.performAs = body;

            __serenityProxy.toString = () => {
                return __serenityProxy.subject;
            };

            __serenityProxy.describedAs = (newSubject: string) => {
                __serenityProxy.subject = newSubject;

                return __serenityProxy;
            }

            __serenityProxy.as = <O>(mapping: (answer: Awaited<A>) => O): Question<Promise<O>> => {
                return Question.about<Promise<O>>(`${ __serenityProxy.subject } as ${ inspected(mapping, { inline: true }) }`, async actor => {
                    const answer = await actor.answer(__serenityProxy)
                    return mapping(answer);
                });
            }

            return createAdapter(__serenityProxy as any);
        }
    }) as Q & Adapter<Awaited<A>>
}

function shouldReflect<A, Q extends Question<A> = Question<A>>(target: Q & { name?: string }, key: string | symbol | number): boolean {

    const proxyKeys: Array<string | symbol | number> = ['arguments', 'caller', 'length', 'name'];

    // return the actual value
    return key in target
        // unless target is a proxy function, because proxy function has built-in .length and .name attribute that could shadow Array.length of the wrapped object
        && !((target as any).name === '__serenityProxy' && (proxyKeys.includes(key)))
}

function shouldProxy(key: string | symbol | number) {
    const prohibited: Array<string | symbol | number> = [
        'then', // don't proxy Promises
    ];

    return ! prohibited.includes(key)
}

class DynamicProp<T> extends Interaction implements Question<T> {
    constructor(protected subject: string, private body: (actor: AnswersQuestions & UsesAbilities) => T) {
        super();
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): T {
        return this.body(actor);
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        await this.body(actor);
    }

    as<O>(mapping: (answer: Awaited<T>) => Promise<O> | O): Question<Promise<O>> {
        return createAdapter(new DynamicProp(`${ this.subject } as ${ inspected(mapping, { inline: true }) }`, async actor => {
            const answer = (await actor.answer(this)) as Awaited<T>;
            return mapping(answer);
        })) as Question<Promise<O>>;
    }

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject;
    }
}
