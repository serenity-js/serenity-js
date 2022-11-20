import { Question } from './Question';

/**
 * A union type that provides a convenient way to represent any value
 * that can be resolved by {@apilink Actor.answer}.
 *
 * @group Questions
 */
export type Answerable<T> = Question<Promise<T>> | Question<T> | Promise<T> | T;
