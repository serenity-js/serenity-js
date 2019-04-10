import { Question } from './Question';

/**
 * @public
 *
 * @typedef {Question<Promise<T>> | Question<T> | Promise<T> | T} Answerable<T>
 */
export type Answerable<T> = Question<Promise<T>> | Question<T> | Promise<T> | T;
