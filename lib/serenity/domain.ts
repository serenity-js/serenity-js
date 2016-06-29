export enum Result {
    /**
     * Scenario failures due to external events or systems that compromise the validity of the test.
     */
    COMPROMISED,
    /**
     *  Scenario failure, due to some other exception.
     */
    ERROR,

    /**
     * Scenario failure, due to an assertion error
     * For a test case, this means one of the tests in the test case failed.
     */
    FAILURE,

    /**
     * The test step was not executed because a previous step in this test case failed.
     * A whole test case can be skipped using tags or annotations to indicate that it is currently "work-in-progress"
     */
    SKIPPED,

    /**
     * The test or test case was deliberately ignored.
     * Tests can be ignored via the @Ignore annotation in JUnit, for example.
     * Ignored tests are not considered the same as pending tests: a pending test is one that
     * has been specified, but the corresponding code is yet to be implemented, whereas an
     * ignored test can be a temporarily-deactivated test (during refactoring, for example).
     */
    IGNORED,

    /**
     * A pending test is one that has been specified but not yet implemented.
     * In a JUnit test case, you can use the (Thucydides) @Pending annotation to mark this.
     * A pending test case is a test case that has at least one pending test.
     */
    PENDING,

    /**
     * The test or test case ran as expected.
     */
    SUCCESS
}

export interface Identifiable {
    id(): string;
}

export class Scenario implements Identifiable {
    private _name;
    private _category;
    private _path;
    private _id;

    constructor(name: string, category: string, path: string, id: string = `${category}:${name}`) {
        this._name      = name;
        this._category  = category;
        this._path      = path;
        this._id        = id;
    }

    public get name(): string {
        return this._name;
    }

    public get category(): string {
        return this._category;
    }

    public get path(): string {
        return this._path;
    }

    public id() {
        return this._id;
    }
}

export class Step implements Identifiable{
    private _name: string;
    private _id: string;
    
    constructor(name:string, id: string = name) {
        this._name = name;
        this._id   = id;
    }
    
    public get name() {
        return this._name;
    }

    public id() {
        return this._id;
    }
}

// todo: refactor - maybe replace both with "outcome<T>"?
export class TestOutcome {
    private _test: Scenario;
    private _result: Result;
    private _error:  Error;
    
    constructor(test: Scenario, result: Result, error?: Error) {
        this._test = test;
        this._result = result;
        this._error  = error;
    }
    
    public get test(): Scenario {
        return this._test;
    }
    
    public get result(): Result {
        return this._result;
    }

    public get error(): Error {
        return this._error;
    }
}

// todo: refactor
export class StepOutcome {
    private _step:   Step;
    private _result: Result;
    private _error:  Error;

    constructor(step: Step, result: Result, error?: Error) {
        this._step   = step;
        this._result = result;
        this._error  = error;
    }

    public get step(): Step {
        return this._step;
    }

    public get result(): Result {
        return this._result;
    }

    public get error(): Error {
        return this._error;
    }
}