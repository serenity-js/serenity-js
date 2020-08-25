import { Question } from './Question';

/**
 * @desc
 *  A union type that provides a convenient way to represent any value
 *  that can be resolved by {@link Actor#answer}.
 *
 * @public
 *
 * @typedef {Question<Promise<T>> | Question<T> | Promise<T> | T} Answerable<T>
 */
export type Answerable<T> = Question<Promise<T>> | Question<T> | Promise<T> | T;
