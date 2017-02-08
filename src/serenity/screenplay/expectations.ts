export type Assertion<T>   = (actual: T) => PromiseLike<void>;
export type Expectation<T> = (expected: T) => Assertion<T>;
