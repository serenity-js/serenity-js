import { MappingFunction } from '../../../io/collections';
import { AnswersQuestions } from '../../actor';

/**
 * @desc
 *  A mapping function converting one type into another.
 *
 * @public
 *
 * @typedef {function(actor: AnswersQuestions) => MappingFunction<V,O>} AnswerMappingFunction<V, O>
 */
export type AnswerMappingFunction<V, O> =
    (actor: AnswersQuestions) => MappingFunction<V, Promise<O> | O>
