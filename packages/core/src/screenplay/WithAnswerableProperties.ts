import { Answerable } from './Answerable';
import { Question } from './Question';

/**
 * @desc
 *  Describes a plain JavaScript object with {@link Answerable} properties.
 *  Typically, used in conjunction with {@link RecursivelyAnswered} and {@link Question.fromObject}.
 *
 * @example
 *  import {
 *    actorCalled, notes, q, Question, QuestionAdapter, WithAnswerableProperties
 *  } from '@serenity-js/core';
 *
 *  interface RequestConfiguration {
 *      headers: Record<string, string>;
 *  }
 *
 *  const requestConfiguration: WithAnswerableProperties<RequestConfiguration> = {
 *      headers: {
 *          Authorization: q`Bearer ${ notes().get('authDetails').token }`
 *      }
 *  }
 *
 *  const question: QuestionAdapter<RequestConfiguration> =
 *      Question.fromObject<RequestConfiguration>(requestConfiguration)
 *
 *  const answer: RequestConfiguration = await actorCalled('Annie').answer(question);
 *
 * @public
 *
 * @typedef {object} WithAnswerableProperties<T>
 */
export type WithAnswerableProperties<T> =
    T extends null | undefined ? T :
        T extends Question<Promise<infer A>> | Question<infer A> | Promise<infer A> ? Answerable<A> :
            T extends object ? Answerable<{ [K in keyof T]: WithAnswerableProperties<T[K]> }> :
                Answerable<T>
;
