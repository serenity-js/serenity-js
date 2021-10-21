/**
 * @desc
 *  Extracts type T of the result returned by Promise<T>.
 *  Given a non-Promised T, returns T.
 */
export type PromisedResult<Result> =
    Result extends Promise<infer A>
        ? A
        : Result;
