import { OneOrMany } from './lists';

export type Assertion<A> = (actual: A) => PromiseLike<void>;
export type Expectation<E, A extends PromiseLike<OneOrMany<E>> | OneOrMany<E>> = (expected: OneOrMany<E>) => Assertion<A>;
