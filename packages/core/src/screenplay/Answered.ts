import { Question } from './Question';

export type Answered<T> =
    T extends null | undefined ? T :          // special case for `null | undefined` when not in `--strictNullChecks` mode
        T extends Question<Promise<infer A>> | Question<infer A> | Promise<infer A> ? Awaited<A> :
            T;
