import { Question } from './Question';

/**
 * @public
 *
 * @typedef {Question<Promise<T>> | Question<T> | Promise<T> | T} KnowableUnknown<T>
 */
export type KnowableUnknown<T> = Question<Promise<T>> | Question<T> | Promise<T> | T;
