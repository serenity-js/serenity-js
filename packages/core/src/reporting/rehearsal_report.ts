import {
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    Outcome,
    Photo,
    PhotoAttempted,
    RecordedActivity,
    RecordedScene,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    Tag,
} from '../domain';
import { ReportExporter } from './report_exporter';

export class RehearsalReport {
    static from(events: Array<DomainEvent<any>>): RehearsalPeriod {
        let previousNode: ReportPeriod<RecordedScene | RecordedActivity>;
        let currentNode:  ReportPeriod<RecordedScene | RecordedActivity>;
        let currentScene: ScenePeriod;

        return events.reduce((fullReport, event) => {
            switch (event.constructor) {    // tslint:disable-line:switch-default   - ignore other events
                case SceneStarts:
                    currentScene = fullReport.append(new ScenePeriod(event)) as ScenePeriod;
                    currentNode  = currentScene;
                    break;
                case ActivityStarts:
                    currentNode = currentNode.append(new ActivityPeriod(event));
                    break;
                case SceneFinished:
                    currentNode = currentNode.concludeWith(event);
                    break;
                case ActivityFinished:
                    // The Photographer triggers a PhotoAttempted event after the ActivityFinished,
                    // that's why we need to cache both the previous and the current node
                    previousNode = currentNode;
                    currentNode  = currentNode.concludeWith(event);
                    break;
                case SceneTagged:
                    currentScene.tagWithPromised(event.value);
                    break;
                case PhotoAttempted:
                    [previousNode, currentNode]
                        .filter(node => !! node && node.matches(event.value.activity))
                        .forEach(node => node.attach(event.value.photo));
                    break;
            }

            return fullReport;
        }, new RehearsalPeriod());
    }
}

export abstract class ReportPeriod<T> {
    public parent:    ReportPeriod<any>;
    public value:     T;

    public children:  Array<ReportPeriod<any>> = [];
    public outcome:   Outcome<T>;

    public startedAt:  number;
    protected finishedAt: number;

    private promisedPhotos: Array<PromiseLike<Photo>> = [];

    constructor(start: DomainEvent<T>) {
        this.value     = start.value;
        this.startedAt = start.timestamp;
    }

    abstract matches(finished: T): boolean;

    concludeWith(finished: DomainEvent<Outcome<any>>) {
        this.finishedAt = finished.timestamp;
        this.outcome    = finished.value;

        if (! this.parent) {
            return this;
        }

        return this.matches(finished.value.subject)
            ? this.parent
            : this.parent.concludeWith(finished);
    }

    attach(promisedPhoto: PromiseLike<Photo>) {
        this.promisedPhotos.push(promisedPhoto);
    }

    photos(): PromiseLike<Photo[]> {
        // todo: maybe use some constant rather than a blunt "undefined"?
        return Promise.all(this.promisedPhotos).then(photos => photos.filter(p => p !== undefined));
    }

    duration() {
        return this.finishedAt - this.startedAt;
    }

    append(child: ReportPeriod<RecordedScene | RecordedActivity>): ReportPeriod<RecordedScene | RecordedActivity> {
        child.parent = this;
        this.children.push(child);

        return child;
    }

    abstract exportedUsing<FORMAT>(exporter: ReportExporter<FORMAT>): PromiseLike<FORMAT>;
}

export class RehearsalPeriod extends ReportPeriod<Rehearsal> {
    matches(finished: Rehearsal): boolean {
        return false;
    }

    exportedUsing<FORMAT>(exporter: ReportExporter<FORMAT>): PromiseLike<FORMAT> {
        return exporter.exportRehearsal(this);
    }

    constructor() {
        super(new DomainEvent(new Rehearsal()));    // todo: DomainEvent? Meh. Can I do better?
        this.parent = undefined;
    }
}

export class Rehearsal {
}

export class ActivityPeriod extends ReportPeriod<RecordedActivity> {
    matches(another: RecordedActivity): boolean {
        return this.value.equals(another);
    }

    exportedUsing<FORMAT>(exporter: ReportExporter<FORMAT>): PromiseLike<FORMAT> {
        return exporter.exportActivity(this);
    }
}

export class ScenePeriod extends ReportPeriod<RecordedScene> {
    private tags: Array<PromiseLike<Tag>> = [];

    matches(another: RecordedScene): boolean {
        return this.value.equals(another);
    }

    exportedUsing<FORMAT>(exporter: ReportExporter<FORMAT>): PromiseLike<FORMAT> {
        return exporter.exportScene(this);
    }

    tagWithPromised(tag: PromiseLike<Tag>) {
        this.tags.push(tag);
    }

    promisedTags() {
        return Promise.all(this.tags);
    }
}
