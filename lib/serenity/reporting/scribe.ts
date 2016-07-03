import {DomainEvent, ScenarioStarted, ScenarioCompleted, StepStarted, StepCompleted} from "../domain/events";
import {Screenshot, Step, Outcome, Scenario, Result} from "../domain/model";
import * as _ from "lodash";
import * as path from "path";
import {parse} from 'stack-trace';

const fs:typeof QioFS = require('q-io/fs');
const dashify = require('dashify');


export class Scribe {

    constructor(private outputRootDir: string) { }

    write(report: any, pathToFile: string): Promise<void> {
        let fullPathToReport = path.join(this.outputRootDir, pathToFile);

        return fs.makeTree(this.outputRootDir).
                then(() => fs.write(fullPathToReport, JSON.stringify(report)));
    }
}


// states:
// - ready to report scenario - initial state
// - reporting scenario       - after ScenarioStarted
// todo: maybe FSM per report?

export class SerenityReporter {

    reportOn(events: DomainEvent<any>[]) : ScenarioReport[] {

        return events.reduce( (reports, event, index, list) => {
            switch(event.constructor.name) {
                case ScenarioStarted.name:      return reports.scenarioStarted(event.value, event.timestamp);

                case StepStarted.name:          return reports.stepStarted(event.value, event.timestamp);

                // case ScreenshotCaptured.name:   break;

                case StepCompleted.name:        return reports.stepCompleted(event.value, event.timestamp);

                case ScenarioCompleted.name:    return reports.scenarioCompleted(event.value, event.timestamp);
            }

            return reports;
        }, new SerenityReports()).extract();
    }
}

class SerenityReports {
    private reports: {[key: string]: ScenarioReport} = {};
    private last: SerenityReport<any>;


    scenarioStarted(scenario: Scenario, timestamp: number) {
        let report = new ScenarioReport(scenario, timestamp);

        this.reports[scenario.id] = report;
        this.last                 = report;

        return this;
    }

    stepStarted(step: Step, timestamp: number) {
        let report = new StepReport(step, timestamp);

        this.last.append(report);
        this.last = report;

        return this;
    }

    stepCompleted(outcome: Outcome<Step>, timestamp: number) {

        this.last.completedWith(outcome, timestamp);
        this.last = this.last.parent;

        return this;
    }

    scenarioCompleted(outcome: Outcome<Scenario>, timestamp: number) {
        this.reports[outcome.subject.id].completedWith(outcome, timestamp);

        return this;
    }

    extract(): any[] {
        return _.values<ScenarioReport>(this.reports).map((report) => report.toJSON());
    }
}

interface ErrorStackFrame {
    declaringClass:string;
    methodName:string;
    fileName:string;
    lineNumber:number;
}

abstract class SerenityReport<T> {
    protected children:  StepReport[] = [];
    protected result:    Result;
    protected error:     Error;
    protected startedAt: number;
    protected duration:  number;
    public    parent:    SerenityReport<any>;

    constructor(startTimestamp:number) {
        this.startedAt = startTimestamp;
    }

    append(stepExecutionReport: StepReport) {
        let report = stepExecutionReport;

        report.parent = this;

        this.children.push(report);
    }

    completedWith(outcome: Outcome<T>, finishedAt: number) {
        this.result   = outcome.result;
        this.error    = outcome.error;
        this.duration = finishedAt - this.startedAt;
    }

    protected errorIfPresent() {
        if (! this.error) {
            return undefined; // so that the field is not rendered (that's what Serenity JVM expects for now)
        }

        return {
            "errorType":    this.error.name,
            "message":      this.error.message,
            "stackTrace":   this.stackTraceOf(this.error)
        };
    }

    private stackTraceOf(error: Error): Array<ErrorStackFrame> {
        return parse(error).map((frame) => {
            return {
                declaringClass: frame.getTypeName() || frame.getFunctionName() || '',
                methodName:     frame.getMethodName() || frame.getFunctionName() || '',
                fileName:       frame.getFileName(),
                lineNumber:     frame.getLineNumber()
            }
        });
    }

    abstract toJSON(): any;
}

class ScenarioReport extends SerenityReport<Scenario> {

    constructor(private scenario: Scenario, startTimestamp: number) {
        super(startTimestamp);
    }

    toJSON(): any {
        return {
            name:           this.scenario.name,
            title:          this.scenario.name,     // todo: do we need both name and title?
            description:    '',                     // todo: missing
            tags:           [],                     // todo: missing
            // driver                               // todo: missing
            startTime:      this.startedAt,
            manual:         false,
            duration:       this.duration,
            result:         Result[this.result],
            testSteps:      this.children.map((report) => report.toJSON()),
            userStory: {
                id:        dashify(this.scenario.category),
                storyName: this.scenario.category,
                path:      this.scenario.path,
                type:      'feature'
            },
            testFailureCause: this.errorIfPresent()
        }
    }
}

class StepReport extends SerenityReport<Step> {
    constructor(private step: Step, startTimestamp: number) {
        super(startTimestamp);
    }

    toJSON(): any {
        return {
            description: this.step.name,
            startTime:   this.startedAt,
            duration:    this.duration,
            result:      Result[this.result],
            children:    this.children.map((report) => report.toJSON()),
            exception:   this.errorIfPresent()
        }
    }

    /* ? */ attachScreenshot(screenshot: Screenshot) { }
}