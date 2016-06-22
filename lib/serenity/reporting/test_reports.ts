import {Test, Step, Result} from "../domain";
import moment = require("moment/moment");

export class StepRecording {
    private description:  string;
    private startTime:    number;
    private result:       Result;
    private duration:     number;

    constructor(step: Step, startedAt: number) {
        this.description = step.name;
        this.startTime   = startedAt;
    }

    public matches(step: Step): boolean {
        return step.name === this.description;
    }

    public finishedWith(result: Result, timestamp: number) {
        this.result   = result;
        this.duration = timestamp - this.startTime;
    }

    public toJSON() {
        return {
            description: this.description,
            startTime:   this.startTime,
            result:      Result[this.result],
            duration:    this.duration
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

    // missing
    private sessionId:    string;
    private driver:       string;

    // private _steps: {[key: string]: StepRecording} = {};
    private _steps:       StepRecording[] = [];

    private _lastStepRecording: StepRecording;
    
    constructor(test: Test, startedAt: number) {
        this.title        = test.title;
        this.name         = test.scenarioName;
        this.testCaseName = test.testCaseName;
        this.startTime    = startedAt;
    }

    public startedStep(step: Step, timestamp: number) {
        // console.log("started step", step.name);

        let recording = new StepRecording(step, timestamp);

        this._steps.push(recording)
        this._lastStepRecording = recording;
    }
    
    public finishedStep(step: Step, result: Result, timestamp: number) {
        // console.log("finished step", step);

        if (this._lastStepRecording.matches(step)) {
            this._lastStepRecording.finishedWith(result, timestamp);
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

            testSteps:      this._steps.map((step) => step.toJSON())
        };
    }
}

export class Recorder {
    
    private _recordings: {[key: string]: TestRecording} = {};
    private _currentRecording: string;

    public startARecordingOf(test: Test, timestamp: number):void {
        // console.log('Recorder::startARecordingOf');

        let recording = new TestRecording(test, timestamp);
        this._recordings[test.id()] = recording;
        this._currentRecording      = test.id();
    }

    public recordStep(step: Step, timestamp: number): void {
        // console.log('Recorder::recordStep');
        this._recordings[this._currentRecording].startedStep(step, timestamp)
    }
    
    public recordStepResultOf(step: Step, result: Result, timestamp: number): void {
        // console.log('Recorder::recordStepResultOf');
        this._recordings[this._currentRecording].finishedStep(step, result, timestamp)
    }

    public recordResultOf(test: Test, result: Result, timestamp: number):void {
        // console.log('Recorder::recordResultOf');
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