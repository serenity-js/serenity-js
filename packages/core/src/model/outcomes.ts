import { JSONObject, match, Serialised, TinyType } from 'tiny-types';
import * as serenitySpecificErrors from '../errors';

export interface SerialisedError extends JSONObject {
    name:    string;
    message: string;
    stack:   string;
}

export interface SerialisedOutcome extends JSONObject {
    code:    number;
    error?:  SerialisedError;
}

export abstract class Outcome extends TinyType {
    static fromJSON = (o: SerialisedOutcome) => match(o.code)
        .when(ExecutionCompromised.Code,    _ => ExecutionCompromised.fromJSON(o))
        .when(ErrorOccurred.Code,           _ => ErrorOccurred.fromJSON(o))
        .when(AssertionFailed.Code, _ => AssertionFailed.fromJSON(o))
        .when(ExecutionSkipped.Code,        _ => ExecutionSkipped.fromJSON(o))
        .when(ExecutionIgnored.Code,        _ => ExecutionIgnored.fromJSON(o))
        .when(ImplementationPending.Code,   _ => ImplementationPending.fromJSON(o))
        .when(ExecutionSuccessful.Code,     _ => ExecutionSuccessful.fromJSON(o))
        .else(_ => { throw new Error(`Outcome could not be deserialised: ${ JSON.stringify(o) }`); }) as Outcome

    protected constructor(protected readonly code: number) {
        super();
    }

    toJSON(): SerialisedOutcome {
        return {
            code: this.code,
        };
    }
}

export abstract class ProblemIndication extends Outcome {

    private static recognisedErrors = [
        ...Object.keys(serenitySpecificErrors).map(key => serenitySpecificErrors[key]),
        Error,
        EvalError,
        RangeError,
        ReferenceError,
        SyntaxError,
        TypeError,
        URIError,
    ];

    protected static deserialise(serialisedError: SerialisedError): Error {
        const constructor = ProblemIndication.recognisedErrors.find(errorType => errorType.name === serialisedError.name) || Error;
        const deserialised = Object.create(constructor.prototype);
        for (const prop in serialisedError) {
            if (serialisedError.hasOwnProperty(prop)) {
                deserialised[prop] = serialisedError[prop];
            }
        }
        return deserialised;
    }

    protected constructor(public readonly error: Error, code: number) {
        super(code);
    }

    toJSON(): SerialisedOutcome {
        return {
            code: this.code,
            error: this.serialise(this.error),
        };
    }

    private serialise(error: Error): SerialisedError {
        return Object.getOwnPropertyNames(error).reduce((serialised, key) => {
            serialised[key] = error[key];
            return serialised;
        }, { name: error.name || error.constructor.name }) as SerialisedError;
    }
}

/**
 * Indicates a failure due to external events or systems that compromise the validity of the test.
 */
export class ExecutionCompromised extends ProblemIndication {
    static Code = 1 << 0;

    static fromJSON = (o: SerialisedOutcome) => new ExecutionCompromised(ProblemIndication.deserialise(o.error));

    constructor(error: Error) {
        super(error, ExecutionCompromised.Code);
    }
}

/**
 * Indicates a failure due to an error other than recognised external system and assertion failures
 */
export class ErrorOccurred extends ProblemIndication {
    static Code = 1 << 1;

    static fromJSON = (o: SerialisedOutcome) => new ErrorOccurred(ProblemIndication.deserialise(o.error));

    constructor(error: Error) {
        super(error, ErrorOccurred.Code);
    }
}

/**
 * Execution of an Activity or Scene has failed due to an assertion error;
 */
export class AssertionFailed extends ProblemIndication {
    static Code = 1 << 2;

    static fromJSON = (o: SerialisedOutcome) => new AssertionFailed(ProblemIndication.deserialise(o.error));

    constructor(error: Error) {
        super(error, AssertionFailed.Code);
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
