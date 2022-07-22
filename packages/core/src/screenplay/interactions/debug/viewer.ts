import { Answerable } from '../../Answerable';
import { Answered } from '../../Answered';
import { DebuggingResult } from './DebuggingResult';

/* istanbul ignore next */
export function viewer<Values extends Array<Answerable<unknown>>>(results: { [ Index in keyof Values ]: DebuggingResult<Answered<Values[Index]>> }): void {
    /**
     *  Use your debugger to inspect the `results` array.
     *  Note that every entry in `results` contains:
     *  - description - a string description produced by invoking d`${ value }` on the original value
     *  - value - the result of invoking `await actor.answer(value)` on the original value
     *  - error - `Error`, if thrown when invoking `await actor.answer(value)` on the original value
     *
     *  @see {d}
     *  @see {Actor#answer}
     */
    debugger;   // eslint-disable-line no-debugger
}
