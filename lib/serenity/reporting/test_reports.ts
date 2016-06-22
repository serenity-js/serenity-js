import {Test, Step, Result} from "../domain";

export class StepRecording {
    private description:  string;
    private startTime:    number;
    private result:       Result;
    private duration:     number;

    private parentRecording: StepRecording   = null;   // todo: can I avoid using a null?
    private nestedSteps:     StepRecording[] = [];

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

    public finishedWith(result: Result, timestamp: number) {
        this.result   = result;
        this.duration = timestamp - this.startTime;
    }

    public isCompleted(): boolean {
        return !!(this.result && this.duration);
    }

    public toJSON() {
        return {
            description: this.description,
            startTime:   this.startTime,
            result:      Result[this.result],
            duration:    this.duration,
            children:    this.nestedSteps.map((step) => step.toJSON())
        }
    }
}

export class TestRecording {
    private title:        string;
    private name:         string;
    private testCaseName: string;

    private startTime:    number;

    private duration:     number;
    private result:       Result;
    private manual:       boolean = false;

    // todo: missing fields
    private sessionId:    string;
    private driver:       string;

    private steps:       StepRecording[] = [];

    private lastStepRecording: StepRecording;
    
    constructor(test: Test, startedAt: number) {
        this.title        = test.title;
        this.name         = test.scenarioName;
        this.testCaseName = test.testCaseName;
        this.startTime    = startedAt;
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
    
    public finishedStep(step: Step, result: Result, timestamp: number) {
        if (this.lastStepRecording.matches(step)) {
            this.lastStepRecording.finishedWith(result, timestamp);

            this.lastStepRecording = this.lastStepRecording.parent();
        }
    }

    public finishedWith(result: Result, timestamp: number) {
        this.result = result;
        this.duration = timestamp - this.startTime;
    }

    public toJSON() {
        return {
            title:          this.title,
            name:           this.name,
            testCaseName:   this.testCaseName,
            startTime:      this.startTime,
            duration:       this.duration,
            result:         Result[this.result],
            manual:         this.manual,
            // sessionId:
            // driver:

            testSteps:      this.steps.map((step) => step.toJSON())
        };
    }
}

export class Recorder {
    
    private _recordings: {[key: string]: TestRecording} = {};
    private _currentRecording: string;

    public startARecordingOf(test: Test, timestamp: number):void {
        let recording = new TestRecording(test, timestamp);

        this._recordings[test.id()] = recording;
        this._currentRecording      = test.id();
    }

    public recordStep(step: Step, timestamp: number): void {
        this._recordings[this._currentRecording].startedStep(step, timestamp)
    }
    
    public recordStepResultOf(step: Step, result: Result, timestamp: number): void {
        this._recordings[this._currentRecording].finishedStep(step, result, timestamp)
    }

    public recordResultOf(test: Test, result: Result, timestamp: number):void {
        this._recordings[test.id()].finishedWith(result, timestamp);
    }
    
    public get recordings() {
        return Object.keys(this._recordings).map((key) => this._recordings[key]);
    }

    public extractRecordingFor(test: Test) {
        let recording = this._recordings[test.id()];

        delete this._recordings[test.id()];

        return recording;
    }
}