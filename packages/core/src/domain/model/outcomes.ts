import { TinyType } from 'tiny-types';

export abstract class Outcome extends TinyType {
    protected constructor(protected readonly code: number) {
        super();
    }
}

export abstract class ProblemIndication extends Outcome {
    protected constructor(protected readonly error: Error, code: number) {
        super(code);
    }
}

/**
 * Indicates a failure due to external events or systems that compromise the validity of the test.
 */
export class ExecutionCompromised extends ProblemIndication {
    constructor(public readonly error: Error) {
        super(error, 1 << 0);
    }
}

/**
 * Indicates a failure due to an error other than recognised external system and assertion failures
 */
export class ErrorOccurred extends ProblemIndication {
    constructor(public readonly error: Error) {
        super(error, 1 << 1);
    }
}

/**
 * Execution of an Activity or Scene has failed due to an assertion error;
 */
export class AssertionFailed extends ProblemIndication {
    constructor(public readonly error: Error) {
        super(error, 1 << 2);
    }
}

/**
 * The Activity was not executed because a previous one has failed.
 * A whole Scene can be marked as skipped to indicate that it is currently "work-in-progress"
 */
export class ExecutionSkipped extends Outcome {
    constructor() {
        super(1 << 3);
    }
}

/**
 * The Activity was deliberately ignored and will not be executed.
 */
export class ExecutionIgnored extends Outcome {
    constructor() {
        super(1 << 4);
    }
}

/**
 * A pending Activity is one that has been specified but not yet implemented.
 * A pending Scene is one that has at least one pending Activity.
 */
export class ImplementationPending extends Outcome {
    constructor() {
        super(1 << 5);
    }
}

/**
 * Scenario or activity ran as expected.
 */
export class ExecutionSuccessful extends Outcome {
    constructor() {
        super(1 << 6);
    }
}
