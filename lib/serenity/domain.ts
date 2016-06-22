export enum Result {
    FAILURE,
    PENDING,
    SUCCESS,
    SKIPPED
}

export interface Identifiable {
    id(): string;
}

export class Test implements Identifiable {
    private _scenarioName;
    private _testCaseName;
    private _title;

    constructor(scenarioName: string, testCaseName: string, title: string = scenarioName) {
        this._scenarioName  = scenarioName;
        this._testCaseName  = testCaseName;
        this._title         = title;
    }

    public get title(): string {
        return this._title;
    }

    public get scenarioName(): string {
        return this._scenarioName;
    }

    public get testCaseName(): string {
        return this._testCaseName;

    }

    public id() {
        return `${this.testCaseName}_${this.scenarioName}`;
    }
}

export class Step implements Identifiable{
    private _name: string;
    
    constructor(name:string) {
        this._name = name;
    }
    
    public get name() {
        return this._name;
    }

    public id() {
        return `${this._name}`;
    }
}

// todo: refactor - maybe replace both with "outcome<T>"?
export class TestOutcome {
    private _test: Test;
    private _result: Result;
    
    constructor(test: Test, result: Result) {
        this._test = test;
        this._result = result;
    }
    
    public get test(): Test {
        return this._test;
    }
    
    public get result(): Result {
        return this._result;
    }
}

// todo: refactor
export class StepOutcome {
    private _step: Step;
    private _result: Result;

    constructor(step: Step, result: Result) {
        this._step   = step;
        this._result = result;
    }

    public get step(): Step {
        return this._step;
    }

    public get result(): Result {
        return this._result;
    }
}