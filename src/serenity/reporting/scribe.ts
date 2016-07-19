import {
    ActivityFinished, ActivityStarts, DomainEvent, PhotoAttempted, SceneFinished, SceneStarts,
} from '../domain/events';
import { Activity, Outcome, Photo, PhotoReceipt, Result, Scene } from '../domain/model';
import { Outlet } from './outlet';

import * as _ from 'lodash';
import * as path from 'path';
import { parse } from 'stack-trace';
import { StackFrame } from 'stack-trace';

export class Scribe {

    constructor(private outlet: Outlet) { }

    write(report: any, pathToFile: string): PromiseLike<string> {
        return this.outlet.sendJSON(pathToFile, report);
    }
}

export interface FormatsEvents {
    of(events: DomainEvent<any>[]): Promise<any[]>;
}

export class EventLog implements FormatsEvents {
    of(events: DomainEvent<any>[]): Promise<string[]> {
        return Promise.resolve(events.map( event => event.toString() ));
    };
}

export class RehearsalReport implements FormatsEvents {

    of(events: DomainEvent<any>[]): Promise<any[]> {

        return events.reduce( (reports, event, index, list) => {

            switch (event.constructor.name) {

                case SceneStarts.name:      return reports.sceneStarted(event.value, event.timestamp);

                case ActivityStarts.name:   return reports.activityStarted(event.value, event.timestamp);

                case ActivityFinished.name: return reports.activityFinished(event.value, event.timestamp);

                case SceneFinished.name:    return reports.sceneFinished(event.value, event.timestamp);

                case PhotoAttempted.name:       return reports.photoTaken(event.value, event.timestamp);

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

    sceneStarted(scene: Scene, timestamp: number) {
        let sceneReport = new SceneReport(scene, timestamp);

        this.reports[scene.id] = sceneReport;
        this.current           = sceneReport;
        this.previous          = sceneReport;

        return this;
    }

    activityStarted(step: Activity, timestamp: number) {
        let activityReport = new ActivityReport(step, timestamp);

        this.current.append(activityReport);
        this.current  = activityReport;

        return this;
    }

    activityFinished(outcome: Outcome<Activity>, timestamp: number) {

        this.current.completedWith(outcome, timestamp);
        this.previous   = this.current;
        this.current    = this.current.parent;

        return this;
    }

    photoTaken(receipt: PhotoReceipt, timestamp: number) {

        let previousReport = <ActivityReport> this.previous; // todo: this might not be the case if event out of sync, add guards
        let currentReport = <ActivityReport> this.current;

        // todo: messy, clean up
        if (this.previous.constructor.name === ActivityReport.name && previousReport.concerns(receipt.activity)) {
            previousReport.attachPhoto(receipt.photo);
        } else if (this.current.constructor.name === ActivityReport.name && currentReport.concerns(receipt.activity)) {
            currentReport.attachPhoto(receipt.photo);
        } else {
            throw new Error(`There's no Activity that the following Photo could be matched with: ${receipt}`);
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
        let onlyDefined = (item) => item !== undefined;

        return Promise.all<I>(items).then( (all) => all.filter(onlyDefined).map(mapper) );
    }

    protected ifNotEmpty<T>(list: T[]): T[] {
        return !! list.length ? list : undefined;
    }

    // todo: extract a parser
    private stackTraceOf(error: Error): Array<ErrorStackFrame> {
        let serenityCode = /node_modules[\\/]serenity/,
            onlyIfFound  = (index) => index !== -1 ? index : undefined,
            firstSerenityStackFrame = (stack: StackFrame[]): number => onlyIfFound(stack.findIndex(frame => !! serenityCode.exec(frame.getFileName()))),
            parsed = parse(error);

        return parsed.slice(0, firstSerenityStackFrame(parsed)).map((frame) => {
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
                testSource:     'cucumber',             // todo: hard-coded, should be configurable
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

    constructor(private activity: Activity, startTimestamp: number) {
        super(startTimestamp);
    }

    concerns(activity: Activity): boolean {
        return this.activity.equals(activity);
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
                    description: this.activity.name,
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
