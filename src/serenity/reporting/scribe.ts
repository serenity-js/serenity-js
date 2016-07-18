import {
    ActivityFinished, ActivityStarts, DomainEvent, PhotoTaken, SceneFinished, SceneStarts,
} from '../domain/events';
import { Activity, Outcome, Photo, PhotoReceipt, Result, Scene } from '../domain/model';
import { Outlet } from './outlet';

import * as _ from 'lodash';
import * as path from 'path';
import { parse } from 'stack-trace';

export class Scribe {

    constructor(private outlet: Outlet) { }

    write(report: any, pathToFile: string): PromiseLike<string> {
        return this.outlet.sendJSON(pathToFile, report);
    }
}

// states:
// - ready to report scenario - initial state
// - reporting scenario       - after SceneStarts
// todo: maybe FSM per report?

export class RehearsalReport {

    of(events: DomainEvent<any>[]): Promise<any[]> {

        return events.reduce( (reports, event, index, list) => {

            switch (event.constructor.name) {

                case SceneStarts.name:      return reports.sceneStarted(event.value, event.timestamp);

                case ActivityStarts.name:   return reports.activityStarted(event.value, event.timestamp);

                case ActivityFinished.name: return reports.activityFinished(event.value, event.timestamp);

                case SceneFinished.name:    return reports.sceneFinished(event.value, event.timestamp);

                case PhotoTaken.name:       return reports.photoTaken(event.value, event.timestamp);

                default:                    break;
            }

            return reports;
        }, new SerenityReports()).extract();
    }
}

class SerenityReports {
    private reports:    {[key: string]: SceneReport} = {};
    private current:    SerenityReport<any>;
    private previous:   SerenityReport<any>;

    sceneStarted(scenario: Scene, timestamp: number) {
        let report = new SceneReport(scenario, timestamp);

        this.reports[scenario.id] = report;
        this.current              = report;
        this.previous             = report;

        return this;
    }

    activityStarted(step: Activity, timestamp: number) {
        let report = new ActivityReport(step, timestamp);

        this.current.append(report);
        this.current = report;

        return this;
    }

    activityFinished(outcome: Outcome<Activity>, timestamp: number) {

        this.current.completedWith(outcome, timestamp);
        this.previous   = this.current;
        this.current    = this.current.parent;

        return this;
    }

    photoTaken(receipt: PhotoReceipt, timestamp: number) {

        if (this.current.constructor.name === ActivityReport.name) {
            // todo: double check if the activity is the same?
            (<ActivityReport> this.current).attachPhoto(receipt.photo);
        } else {
            (<ActivityReport> this.previous).attachPhoto(receipt.photo);
        }

        return this;
    }

    sceneFinished(outcome: Outcome<Scene>, timestamp: number) {
        this.reports[outcome.subject.id].completedWith(outcome, timestamp);

        return this;
    }

    extract(): Promise<any[]> {
        return Promise.all(_.values<SceneReport>(this.reports).map((report) => report.toJSON()));
    }
}

interface ErrorStackFrame {
    declaringClass: string;
    methodName:     string;
    fileName:       string;
    lineNumber:     number;
}

abstract class SerenityReport<T> {
    protected children:  ActivityReport[] = [];
    protected result:    Result;
    protected error:     Error;
    protected startedAt: number;
    protected duration:  number;
    public    parent:    SerenityReport<any>;

    constructor(startTimestamp: number) {
        this.startedAt = startTimestamp;
    }

    append(stepExecutionReport: ActivityReport) {
        let report = stepExecutionReport;

        report.parent = this;

        this.children.push(report);
    }

    completedWith(outcome: Outcome<T>, finishedAt: number) {
        this.result   = outcome.result;
        this.error    = outcome.error;
        this.duration = finishedAt - this.startedAt;
    }

    abstract toJSON(): PromiseLike<any>;

    protected errorIfPresent() {
        if (! this.error) {
            return undefined; // so that the field is not rendered (that's what Serenity JVM expects for now)
        }

        return {
            'errorType':    this.error.name,
            'message':      this.error.message,
            'stackTrace':   this.stackTraceOf(this.error),
        };
    }

    protected mapAll<I>(items: PromiseLike<I>[], mapper: (I) => any = (x) => x): PromiseLike<any[]> {
        return Promise.all<I>(items).then( (all) => all.map(mapper) );
    }

    protected ifNotEmpty<T>(list: T[]): T[] {
        return !! list.length ? list : undefined;
    }

    private stackTraceOf(error: Error): Array<ErrorStackFrame> {
        return parse(error).map((frame) => {
            return {
                declaringClass: frame.getTypeName() || frame.getFunctionName() || '',
                methodName:     frame.getMethodName() || frame.getFunctionName() || '',
                fileName:       frame.getFileName(),
                lineNumber:     frame.getLineNumber(),
            };
        });
    }
}

class SceneReport extends SerenityReport<Scene> {

    constructor(private scenario: Scene, startTimestamp: number) {
        super(startTimestamp);
    }

    toJSON(): PromiseLike<any> {
        return this.mapAll(this.children.map((r) => r.toJSON())).then( (serialisedChildren) => {

            return {
                name:           this.scenario.name,
                title:          this.scenario.name,     // todo: do we need both the name and the title?
                description:    '',                     // todo: missing
                tags: [],                               // todo: missing
                // driver                               // todo: missing
                startTime:      this.startedAt,
                manual:         false,
                duration:       this.duration,
                result:         Result[this.result],
                testSteps:      serialisedChildren,
                userStory: {
                    id:         this.dashify(this.scenario.category),
                    storyName:  this.scenario.category,
                    path:       path.relative(process.cwd(), this.scenario.path),   // todo: introduce some relative path resolver
                    type:       'feature',
                },
                testFailureCause: this.errorIfPresent(),
            };
        });
    }

    private dashify(name: string) {
        let dashified = name
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[ \t\W]/g, '-')
            .replace(/^-+|-+$/g, '');

        return dashified.toLowerCase();
    }
}

class ActivityReport extends SerenityReport<Activity> {
    private promisedPhotos: PromiseLike<Photo>[] = [];

    constructor(private step: Activity, startTimestamp: number) {
        super(startTimestamp);
    }

    attachPhoto(promisedPhoto: Promise<Photo>) {
        this.promisedPhotos.push(promisedPhoto);
    }

    completedWith(outcome: Outcome<Activity>, finishedAt: number) {
        super.completedWith(outcome, finishedAt);
    }

    toJSON(): PromiseLike<any> {
        return this.mapAll(this.promisedPhotos, this.serialise).then( (serialisedPhotos) => {
            return this.mapAll(this.children.map((r) => r.toJSON())).then( (serialisedChildren) => {
                return {
                    description: this.step.name,
                    startTime:   this.startedAt,
                    duration:    this.duration,
                    result:      Result[this.result],
                    children:    serialisedChildren,
                    exception:   this.errorIfPresent(),
                    screenshots: this.ifNotEmpty(serialisedPhotos),
                };
            });
        });
    }

    private serialise(photo: Photo) {
        return { screenshot: path.basename(photo.path) };
    }
}
