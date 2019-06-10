import { Answerable } from '../Answerable';
import { Question } from '../Question';

/**
 * @desc
 *  Enables the {@link Actor} to answer a {@link Question} about the system under test
 *
 * @public
 */
export interface AnswersQuestions {
    answer<T>(knownUnknown: Answerable<T>): Promise<T>;
}
