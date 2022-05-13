import { isPlainObject, Success } from 'tiny-types';

import { LogicError } from '../../errors';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { DynamicRecord } from '../DynamicRecord';
import { Question, QuestionAdapter } from '../Question';

/**
 * @desc
 *  Represents a Screenplay-style [Dictionary](https://en.wikipedia.org/wiki/Associative_array),
 *  capable of interpreting object structures with nested Questions.
 *
 * @example
 *  import { actorCalled, Note, q } from '@serenity-js/core'
 *  import { Send, PostRequest } from '@serenity-js/web'
 *  import { AxiosRequestConfig } from 'axios'
 *
 *  actorCalled('Daisy').attemptsTo(
 *    Send.a(
 *      PostRequest.to('/products/2').with({ name: 'apple' })
 *        .using(Dictionary.of<AxiosRequestConfig>({
 *          headers: {
 *            Authorization: q`Bearer ${ Note.of('auth_token') }`,
 *          },
 *        })
 *      )
 *    )
 */
export class Dictionary {
    /**
     * Node.js doesn't maintain stack across async calls,
     * so we can't rely on any built-in protection mechanism against an infinite recursion
     * See https://github.com/nodejs/node/issues/33023
     *
     * The limit of 100 recursions is completely arbitrary; we might need to adjust it either side
     * or make it configurable altogether, depending on what developers need.
     *
     * If you have a strong view on this matter, please share it via a ticket at http://github.com/serenity-js/serenity-js
     */
    private static maxRecursiveCallsLimit = 100;

    /**
     * @desc
     *  Initiates a new `Dictionary<T>`
     *
     * @param {Answerable<T>} source
     *  An object to be turned into a dictionary
     *
     * @param {...overrides: Array<Answerable<Partial<T>>>} overrides
     *  Additional objects, which properties will override the properties coming from the original source
     *
     * @returns {QuestionAdapter<T>}
     */
    static of<T extends object>(
        source: Answerable<DynamicRecord<T>>,
        ...overrides: Array<Answerable<DynamicRecord<Partial<T>>>>
    ): QuestionAdapter<T> {

        return Question.about<T>('dictionary', async actor => {

            const sources: Array<Partial<T>> = [];

            for (const [i, currentSource] of [source, ...overrides].entries()) {
                sources.push(
                    await this.recursivelyAnswer(actor, currentSource, `argument ${ i }`) as Partial<T>
                );
            }

            return Object.assign({}, ...sources);
        });
    }

    private static async recursivelyAnswer<T extends object>(
        actor: AnswersQuestions & UsesAbilities,
        answerable: Answerable<DynamicRecord<T>> | Answerable<T>,
        description: string,
        currentRecursion = 0
    ): Promise<T> {
        if (currentRecursion >= this.maxRecursiveCallsLimit) {
            throw new LogicError(`Dictionary has reached the limit of ${ this.maxRecursiveCallsLimit } recursive calls while trying to resolve ${ description }. Could it contain cyclic references?`);
        }

        const answer = await actor.answer(answerable);

        if (this.isARecord(answer)) {
            const entries = Object.entries(answer);
            const answeredEntries = [];

            for (const [key, value] of entries) {
                answeredEntries.push([key, await this.recursivelyAnswer(actor, value as any, description, currentRecursion + 1)])
            }

            return Object.fromEntries(answeredEntries) as T;
        }

        if (Array.isArray(answer)) {
            const answeredEntries = [];

            for (const item of answer) {
                answeredEntries.push(await this.recursivelyAnswer(actor, item, description, currentRecursion + 1));
            }

            return answeredEntries as unknown as T;
        }

        return answer;
    }

    private static isARecord(value: any): value is Record<string, unknown> {
        if (! (isPlainObject().check(value) instanceof Success)) {
            return false;
        }

        if (Object.keys(value).some(key => typeof key !== 'string')) {
            return false;
        }

        return true;
    }
}
