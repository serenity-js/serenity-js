import {
    Activity,
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    Outcome,
    Photo,
    PhotoAttempted,
    PhotoReceipt,
    Result,
    Scene,
    SceneFinished,
    SceneStarts,
} from '../domain';
import { Stage, StageCrewMember } from '../stage';
import { FileSystem } from './file_system';
import * as path from 'path';
import { StackFrame, parse } from 'stack-trace';

import { Md5 } from 'ts-md5/dist/md5';

export class JsonReporter implements StageCrewMember {
    private static Events_of_Interest = [ SceneStarts, ActivityStarts, ActivityFinished, PhotoAttempted, SceneFinished ];
    private stage: Stage;

    private rehearsal: Rehearsal;

    constructor(private fs: FileSystem) {
    }

    assignTo(stage: Stage) {
        this.stage = stage;

        this.stage.manager.registerInterestIn(JsonReporter.Events_of_Interest, this);
    }

    notifyOf(event: DomainEvent<any>): void {
        switch (event.constructor.name) {
            case SceneStarts.name:      return this.sceneStarts(event);
            case ActivityStarts.name:   return this.activityStarts(event);
            case ActivityFinished.name: return this.activityFinished(event);
            case SceneFinished.name:    return this.sceneFinished(event);
            case PhotoAttempted.name:   return this.photoAttempted(event);
            default: break; // ignore any other events
        }
    }

    private sceneStarts({ value, timestamp }: SceneStarts): void {
        this.rehearsal = new Rehearsal(value, timestamp);
    }

    private activityStarts({ value, timestamp }: ActivityStarts): void {
        this.rehearsal.activityStarts(value, timestamp);
    }

    private activityFinished({ value, timestamp }: ActivityFinished): void {
        this.rehearsal.activityFinished(value, timestamp);
    }

    private photoAttempted({ value, timestamp }: PhotoAttempted): void {
        this.rehearsal.photoTaken(value, timestamp);
    }

    private sceneFinished({ value, timestamp }: SceneFinished): void {
        let filename = `${ Md5.hashStr(value.subject.id) }.json`;

        this.rehearsal.finished(value, timestamp);

        this.stage.manager.informOfWorkInProgress(
            this.rehearsal.report().then(report => this.fs.store(filename, JSON.stringify(report)))
        );
    }
}

class Rehearsal {
    private current:    SerenityReport<any>;
    private previous:   SerenityReport<any>;

    constructor(scene: Scene, timestamp: number) {
        let sceneReport = new SceneReport(scene, timestamp);

        this.current  = sceneReport;
        this.previous = sceneReport;
    }

    activityStarts(step: Activity, timestamp: number) {
        let activityReport = new ActivityReport(step, timestamp);

        this.current.append(activityReport);
        this.current  = activityReport;
    }

    activityFinished(outcome: Outcome<Activity>, timestamp: number) {

        this.current.completedWith(outcome, timestamp);
        this.previous   = this.current;
        this.current    = this.current.parent;
    }

    finished(outcome: Outcome<Scene>, timestamp: number) {
        this.current.completedWith(outcome, timestamp);
    }

    photoTaken(receipt: PhotoReceipt, timestamp: number) {

        [ this.previous, this.current ]
            .filter(_ => _ instanceof ActivityReport)
            .map(_ => <ActivityReport> _)
            .filter(_ => _.concerns(receipt.activity))
            .map(_ => _.attachPhoto(receipt.photo));
    }

    report(): Promise<any> {
        return this.current.toJSON();
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

    abstract toJSON(): Promise<any>;

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

    protected mapAll<I>(items: Promise<I>[], mapper: (I) => any = (x) => x): Promise<any[]> {
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

    toJSON(): Promise<any> {
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
    private promisedPhotos: Promise<Photo>[] = [];

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

    toJSON(): Promise<any> {
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
