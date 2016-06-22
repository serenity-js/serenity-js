import {Test, Step, TestResult} from "../domain";
import moment = require("moment/moment");

export class Recording {
    private title:        string;
    private name:         string;
    private testCaseName: string;

    private startTime:    number;

    private duration:     number;
    private result:       TestResult;
    private manual:       boolean = false;

    // missing
    private sessionId:    string;
    private driver:       string;
    
    constructor(test: Test, startedAt: number) {
        this.title        = test.title;
        this.name         = test.scenarioName;
        this.testCaseName = test.testCaseName;
        this.startTime    = startedAt;
    }

    public finishedWith(result: TestResult): Recording {
        this.result = result;
        
        return this;
    }

    public at(timestamp: number) {
        this.duration = timestamp - this.startTime;
    }

    public toJSON() {
        return {
            title:          this.title,
            name:           this.name,
            testCaseName:   this.testCaseName,
            startTime:      this.startTime,
            duration:       this.duration,
            result:         TestResult[this.result],
            manual:         this.manual
            // sessionId:
            // driver:
        };
    }
}

export class Recorder {
    
    private _recordings: {[key: string]: Recording} = {};

    public startARecordingOf(test: Test, timestamp: number):void {
        this._recordings[test.id()] = new Recording(test, timestamp);
    }

    public recordStartOf(step: Step, timestamp: number): void {
        
    }
    
    public recordResultOfStep(step: Step, timestamp: number): void {
        
    }

    public recordResultOf(test: Test, result: TestResult, timestamp: number):void {
        this._recordings[test.id()].finishedWith(result).at(timestamp);
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