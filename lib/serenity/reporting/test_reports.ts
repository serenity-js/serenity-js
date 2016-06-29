import {Scenario, Step, Result, TestOutcome, StepOutcome} from "../domain";
import {parse} from 'stack-trace';

export interface SerenityStackFrame {
    declaringClass:string;
    methodName:string;
    fileName:string;
    lineNumber:number;
}

export class StepRecording {
    private description:  string;
    private startTime:    number;
    private result:       Result;
    private duration:     number;

    private parentRecording: StepRecording   = null;   // todo: can I avoid using a null?
    private nestedSteps:     StepRecording[] = [];

    private error:        Error;

    constructor(step: Step, startedAt: number) {
        this.description = step.name;
        this.startTime   = startedAt;
    }

    public parent(): StepRecording {
        return this.parentRecording;
    }

    public nest(stepRecording: StepRecording) {
        stepRecording.nestInside(this);

        this.nestedSteps.push(stepRecording);
    }

    public nestInside(stepRecording: StepRecording) {
        this.parentRecording = stepRecording;
    }

    public matches(step: Step): boolean {
        return step.name === this.description;
    }

    public finishedWith(outcome: StepOutcome, timestamp: number) {
        this.result   = outcome.result;
        this.error    = outcome.error;
        this.duration = timestamp - this.startTime;
    }

    public isCompleted(): boolean {
        return !!(this.result && this.duration);
    }

    private hasError(): boolean {
        return !! this.error;
    }

    private stackTraceOf(error: Error): Array<SerenityStackFrame> {
        return parse(error).map((frame) => {
            return {
                declaringClass: frame.getTypeName() || frame.getFunctionName() || '',
                methodName:     frame.getMethodName() || frame.getFunctionName() || '',
                fileName:       frame.getFileName(),
                lineNumber:     frame.getLineNumber()
            }
        });
    }

    private toJavaStandard(error: Error) {
        return {
            "errorType":    error.name,
            "message":      error.message,
            "stackTrace":   this.stackTraceOf(error)
        };
    }

    public toJSON() {
        return {
            description: this.description,
            startTime:   this.startTime,
            result:      Result[this.result],
            duration:    this.duration,
            children:    this.nestedSteps.map((step) => step.toJSON()),

            // fixme: not a big fan of setting the fields to undefined, but that's how we can ensure that  they don't get serialised.
            // fixme: those three fields seem massively redundant
            exception:   this.hasError() ? this.toJavaStandard(this.error) : undefined
        }
    }
}

export class TestRecording {
    private _title:        string;
    private _name:         string;
    private _category: string;

    private startTime:    number;

    private duration:     number;
    private result:       Result;
    private manual:       boolean = false;

    private error:        Error;

    // todo: missing fields
    private sessionId:    string;
    private driver:       string;

    private steps:       StepRecording[] = [];

    private lastStepRecording: StepRecording;
    
    constructor(test: Scenario, startedAt: number) {
        this._title     = test.name;
        this._name      = test.name;
        this._category  = test.category;
        this.startTime  = startedAt;
    }

    public startedStep(step: Step, timestamp: number) {
        let recording = new StepRecording(step, timestamp);

        if (this.lastStepRecording && ! this.lastStepRecording.isCompleted()) {
            this.lastStepRecording.nest(recording);
        } else {
            this.steps.push(recording)
        }

        this.lastStepRecording = recording;
    }
    
    public finishedStep(outcome: StepOutcome, timestamp: number) {
        if (this.lastStepRecording.matches(outcome.step)) {
            this.lastStepRecording.finishedWith(outcome, timestamp);

            this.lastStepRecording = this.lastStepRecording.parent();
        }
    }

    public finishedWith(outcome: TestOutcome, timestamp: number) {
        this.result = outcome.result;
        this.error  = outcome.error;
        this.duration = timestamp - this.startTime;
    }

    private hasError(): boolean {
        return !! this.error;
    }

    private stackTraceOf(error: Error): Array<SerenityStackFrame> {
        return parse(error).map((frame) => {
            return {
                declaringClass: frame.getTypeName() || '',
                methodName:     frame.getMethodName() || frame.getFunctionName() || '',
                fileName:       frame.getFileName(),
                lineNumber:     frame.getLineNumber()
            }
        });
    }

    private toJavaStandard(error: Error) {
        return {
            "errorType":    error.name,
            "message":      error.message,
            "stackTrace":   this.stackTraceOf(error)
        };
    }

    public toJSON() {
        return {
            title:          this._title,
            name:           this._name,
            testCaseName:   this._category,
            startTime:      this.startTime,
            duration:       this.duration,
            result:         Result[this.result],
            manual:         this.manual,
            // sessionId:
            // driver:

            testSteps:          this.steps.map((step) => step.toJSON()),

            // fixme: not a big fan of setting the fields to undefined, but that's how we can ensure that  they don't get serialised.
            // fixme: those three fields seem massively redundant
            testFailureCause:     this.hasError() ? this.toJavaStandard(this.error) : undefined,
            testFailureClassname: this.hasError() ? this.error.name : undefined,
            testFailureMessage:   this.hasError() ? this.error.message : undefined,

            annotatedResult:      this.hasError() ? Result[this.result] : undefined

            // todo: missing
            // "testFailureClassname": "java.lang.AssertionError",
            // "testFailureMessage": "\nExpected: displaying the status as \u0027failing\u0027\n     but: was \u003cProjectInformation{name\u003dMy App, status\u003d[successful]}\u003e",
            // "annotatedResult": "FAILURE",
        };
    }
}

export class Recorder {
    
    private _recordings: {[key: string]: TestRecording} = {};
    private _currentRecording: string;

    public startARecordingOf(test: Scenario, timestamp: number):void {
        let recording = new TestRecording(test, timestamp);

        this._recordings[test.id()] = recording;
        this._currentRecording      = test.id();
    }

    public recordStep(step: Step, timestamp: number): void {
        this._recordings[this._currentRecording].startedStep(step, timestamp)
    }
    
    public recordStepResultOf(outcome: StepOutcome, timestamp: number): void {
        this._recordings[this._currentRecording].finishedStep(outcome, timestamp)
    }

    public recordResultOf(outcome: TestOutcome, timestamp: number):void {
        this._recordings[outcome.test.id()].finishedWith(outcome, timestamp);
    }
    
    public get recordings() {
        return Object.keys(this._recordings).map((key) => this._recordings[key]);
    }

    public extractRecordingFor(test: Scenario) {
        let recording = this._recordings[test.id()];

        delete this._recordings[test.id()];

        return recording;
    }
}