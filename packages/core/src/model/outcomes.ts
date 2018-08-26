import { JSONObject, match, TinyType } from 'tiny-types';
import { ErrorSerialiser, SerialisedError } from '../io';

export interface SerialisedOutcome extends JSONObject {
    code:    number;
    error?:  SerialisedError;
}

export abstract class Outcome extends TinyType {
    static fromJSON = (o: SerialisedOutcome) => match(o.code)
        .when(ExecutionCompromised.Code,                _ => ExecutionCompromised.fromJSON(o))
        .when(ExecutionFailedWithError.Code,            _ => ExecutionFailedWithError.fromJSON(o))
        .when(ExecutionFailedWithAssertionError.Code,   _ => ExecutionFailedWithAssertionError.fromJSON(o))
        .when(ExecutionSkipped.Code,                    _ => ExecutionSkipped.fromJSON(o))
        .when(ExecutionIgnored.Code,                    _ => ExecutionIgnored.fromJSON(o))
        .when(ImplementationPending.Code,               _ => ImplementationPending.fromJSON(o))
        .when(ExecutionSuccessful.Code,                 _ => ExecutionSuccessful.fromJSON(o))
        .else(_ => { throw new Error(`Outcome could not be deserialised: ${ JSON.stringify(o) }`); }) as Outcome

    protected constructor(protected readonly code: number) {
        super();
    }

    isWorseThan(another: Outcome): boolean {
        return this.code < another.code;
    }

    toJSON(): SerialisedOutcome {
        return {
            code: this.code,
        };
    }
}

export abstract class ProblemIndication extends Outcome {

    protected constructor(public readonly error: Error, code: number) {
        super(code);
    }

    toJSON(): SerialisedOutcome {
        return {
            code: this.code,
            error: ErrorSerialiser.serialise(this.error),
        };
    }
}

/**
 * Indicates a failure due to external events or systems that compromise the validity of the test.
 */
export class ExecutionCompromised extends ProblemIndication {
    static Code = 1 << 0;

    static fromJSON = (o: SerialisedOutcome) => new ExecutionCompromised(ErrorSerialiser.deserialise(o.error));

    constructor(error: Error) {
        super(error, ExecutionCompromised.Code);
    }
}

/**
 * Indicates a failure due to an error other than recognised external system and assertion failures
 */
export class ExecutionFailedWithError extends ProblemIndication {
    static Code = 1 << 1;

    static fromJSON = (o: SerialisedOutcome) => new ExecutionFailedWithError(ErrorSerialiser.deserialise(o.error));

    constructor(error: Error) {
        super(error, ExecutionFailedWithError.Code);
    }
}

/**
 * Execution of an Activity or Scene has failed due to an assertion error;
 */
export class ExecutionFailedWithAssertionError extends ProblemIndication {
    static Code = 1 << 2;

    static fromJSON = (o: SerialisedOutcome) => new ExecutionFailedWithAssertionError(ErrorSerialiser.deserialise(o.error));

    constructor(error: Error) {
        super(error, ExecutionFailedWithAssertionError.Code);
    }
}

/**
 * The Activity was not executed because a previous one has failed.
 * A whole Scene can be marked as skipped to indicate that it is currently "work-in-progress"
 */
export class ExecutionSkipped extends Outcome {
    static Code = 1 << 3;

    static fromJSON = (o: SerialisedOutcome) => new ExecutionSkipped();

    constructor() {
        super(ExecutionSkipped.Code);
    }
}

/**
 * The Activity was deliberately ignored and will not be executed.
 */
export class ExecutionIgnored extends Outcome {
    static Code = 1 << 4;

    static fromJSON = (o: SerialisedOutcome) => new ExecutionIgnored();

    constructor() {
        super(ExecutionIgnored.Code);
    }
}

/**
 * A pending Activity is one that has been specified but not yet implemented.
 * A pending Scene is one that has at least one pending Activity.
 */
export class ImplementationPending extends Outcome {
    static Code = 1 << 5;

    static fromJSON = (o: SerialisedOutcome) => new ImplementationPending();

    constructor() {
        super(ImplementationPending.Code);
    }
}

/**
 * Scenario or activity ran as expected.
 */
export class ExecutionSuccessful extends Outcome {
    static Code = 1 << 6;

    static fromJSON = (o: SerialisedOutcome) => new ExecutionSuccessful();

    constructor() {
        super(ExecutionSuccessful.Code);
    }
}
