import { Question } from './Question';

/**
 * @public
 */
export type KnownUnknown<T> = Question<Promise<T>> | Question<T> | Promise<T> | T;
