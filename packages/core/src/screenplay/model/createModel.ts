import { LogicError } from '../../errors';
import { inspected } from '../../io/inspected';
import { Actor, AnswersQuestions, UsesAbilities } from '../actor';
import { Interaction } from '../Interaction';
import { Question } from '../Question';
import { Awaited } from './Awaited';
import { Model } from './Model';

export function createModel<A, Q extends Question<A> = Question<A>>(question: Q): Q & Model<Awaited<A>> {

    return new Proxy<Q>(question, {

        get(target: Q, key: string | symbol | number, receiver: any) {
            if (key === Symbol.toPrimitive) {
                return (_hint: 'number' | 'string' | 'default') => {
                    return target.toString();
                }
            }

            if (key in target) {
                return Reflect.get(target, key, receiver);
            }

            if (doNotProxy(key)) {
                return;
            }

            const fieldDescription = (typeof key === 'number' || /^\d+$/.test(String(key)))
                ? `[${ String(key) }]`  // array index
                : `.${ String(key) }`;  // field/method name

            // when property is invoked as a method
            function proxy(...originalParameters) {

                const parameterDescriptions = [
                    '(',
                    originalParameters.map(p => inspected(p, { inline: true, markQuestions: true })).join(', '),
                    ')'
                ].join('');

                const originalSubject = inspected(question, { inline: true, markQuestions: true });

                return createModel(new DynamicProp(originalSubject + fieldDescription + parameterDescriptions, async actor => {
                    // convert parameters from Answerable<T> => T
                    const parameters = await (Promise.all(
                        originalParameters.map(parameter => actor.answer(parameter))
                    ));

                    // resolve the original answer
                    const answer = await actor.answer(target);

                    if (answer === undefined) {
                        throw new LogicError(`${ target } is undefined, can't read property "${ String(key) }"`);
                    }

                    // invoke the method call on the original answer
                    return answer[key](...parameters)
                }));
            }

            const originalSubject = inspected(question, { inline: true, markQuestions: true });

            proxy.subject = originalSubject + fieldDescription

            // when property is accessed as a field
            const body = async (actor: Actor) => {
                const answer = await actor.answer(target);

                if (answer === undefined) {
                    throw new LogicError(`${ target } is undefined, can't read property "${ String(key) }"`);
                }

                return answer[key];
            };

            proxy.answeredBy = body;
            proxy.performAs = body;

            proxy.toString = () => {
                return proxy.subject;
            };

            proxy.describedAs = (newSubject: string) => {
                proxy.subject = newSubject;

                return proxy;
            }

            proxy.as = <O>(mapping: (answer: Awaited<A>) => O): Question<Promise<O>> => {
                return Question.about<Promise<O>>(`${ proxy.subject } as ${ inspected(mapping, { inline: true }) }`, async actor => {
                    const answer = await actor.answer(proxy)
                    return mapping(answer);
                });
            }

            return createModel(proxy as any);
        }
    }) as Q & Model<Awaited<A>>
}

function doNotProxy(key: string | symbol | number) {
    const prohibited: Array<string | symbol | number> = [
        'then', // don't proxy Promises
    ];

    return prohibited.includes(key)
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
        return createModel(new DynamicProp(`${ this.subject } as ${ inspected(mapping, { inline: true }) }`, async actor => {
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
