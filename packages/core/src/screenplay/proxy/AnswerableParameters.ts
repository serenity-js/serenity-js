import { Answerable } from '../Answerable';

/**
 * @package
 */
export type AnswerableParameters<T extends unknown[]> =
    { [P in keyof T]: Answerable<T[P]> }
