import { LogicError } from '../../../errors';
import { inspected } from '../../../io/inspected';
import { Actor } from '../../actor';
import { PromisedResult, ProxyQuestion } from '../../proxy';
import { Question } from '../../Question';

export function createProxyQuestion<A, Q extends Question<A> = Question<A>>(question: Q): Q & ProxyQuestion<PromisedResult<A>> {

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

                return Question.about(originalSubject + fieldDescription + parameterDescriptions, async actor => {
                    // convert parameters from Answerable<T> => T
                    const parameters = await (Promise.all(
                        originalParameters.map(parameter => actor.answer(parameter))
                    ));

                    // resolve the original answer
                    const answer = await actor.answer(target);

                    // invoke the method call on the original answer
                    return answer[key](...parameters)
                });
            }

            const originalSubject = inspected(question, { inline: true, markQuestions: true });

            proxy.subject = originalSubject + fieldDescription

            // when property is accessed as a field
            proxy.answeredBy = async (actor: Actor) => {
                const answer = await actor.answer(target);

                if (answer === undefined) { // todo: or null?
                    throw new LogicError(`${ target } is undefined, can't read property "${ String(key) }"`);
                }

                return answer[key];
            };

            proxy.toString = () => {
                return proxy.subject;
            };

            proxy.describedAs = (newSubject: string) => {
                proxy.subject = newSubject;

                return proxy;
            }

            proxy.as = <O>(mapping: (answer: PromisedResult<A>) => O): Question<Promise<O>> => {
                return Question.about<Promise<O>>(`${ proxy.subject } as ${ inspected(mapping, { inline: true }) }`, async actor => {
                    const answer = await actor.answer(proxy)
                    return mapping(answer);
                });
            }

            return createProxyQuestion(proxy as any);
        }
    }) as Q & ProxyQuestion<PromisedResult<A>>
}

function doNotProxy(key: string | symbol | number) {
    const prohibited: Array<string | symbol | number> = [
        'then', // don't proxy Promises
    ];

    return prohibited.includes(key)
}
