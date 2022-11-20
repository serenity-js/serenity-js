import { Question } from './Question';

/**
 * Describes the type of answer a given {@apilink Answerable} would
 * resolve to when given to {@apilink Actor.answer}.
 *
 * ```ts
 * Answered<Answerable<T>> === T
 * ```
 *
 * @group Questions
 */
export type Answered<T> =
    T extends null | undefined ? T :          // special case for `null | undefined` when not in `--strictNullChecks` mode
        T extends Question<Promise<infer A>> | Question<infer A> | Promise<infer A> ? Awaited<A> :
            T;
