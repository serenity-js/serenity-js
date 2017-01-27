import {
    Activity,
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    Outcome,
    Scene,
    SceneFinished,
    SceneStarts,
} from '../../serenity/domain';
import { ReportExporter } from './report_exporter';

export class RehearsalReport {
    static from(events: Array<DomainEvent<any>>): RehearsalPeriod {
        let currentNode = undefined;

        return events.reduce((fullReport, event) => {
            switch (event.constructor) {    // tslint:disable-line:switch-default   - ignore other events
                case SceneStarts:
                    currentNode = fullReport.append(new ScenePeriod(event));
                    break;
                case ActivityStarts:
                    currentNode = currentNode.append(new ActivityPeriod(event));
                    break;
                case SceneFinished:
                    currentNode = currentNode.concludeWith(event);
                    break;
                case ActivityFinished:
                    currentNode = currentNode.concludeWith(event);
                    break;
            }

            return fullReport;
        }, new RehearsalPeriod());
    }
}

export abstract class ReportPeriod<T> {
    protected startedAt:  number;
    protected finishedAt: number;

    public parent:    ReportPeriod<any>;
    public value:     T;
    public children:  Array<ReportPeriod<any>> = [];
    public outcome:   Outcome<T>;

    constructor(start: DomainEvent<T>) {
        this.value     = start.value;
        this.startedAt = start.timestamp;
    }

    abstract matches(finished: DomainEvent<Outcome<any>>): boolean;

    concludeWith(finished: DomainEvent<Outcome<any>>) {
        this.finishedAt = finished.timestamp;
        this.outcome    = finished.value;

        return this.parent;
    }

    duration() {
        // todo: error handling on incomplete object;
        return this.finishedAt - this.startedAt;
    }

    append(child: ReportPeriod<Scene | Activity>): ReportPeriod<Scene | Activity> {
        child.parent = this;
        this.children.push(child);

        return child;
    }

    abstract exportedUsing<FORMAT>(exporter: ReportExporter<FORMAT>): PromiseLike<FORMAT>;
}

export class RehearsalPeriod extends ReportPeriod<Rehearsal> {
    matches(finished: DomainEvent<Outcome<any>>): boolean {
        return false;
    }

    exportedUsing<FORMAT>(exporter: ReportExporter<FORMAT>): PromiseLike<FORMAT> {
        return exporter.exportRehearsal(this);
    }

    constructor() {
        super(new DomainEvent(new Rehearsal()));    // todo: DomainEvent? Meh. Can I do better?
        this.parent = this;
    }
}

export class Rehearsal {
}

export class ActivityPeriod extends ReportPeriod<Activity> {
    matches(finished: DomainEvent<Outcome<any>>): boolean {
        return this.value.equals(finished.value.subject);
    }

    exportedUsing<FORMAT>(exporter: ReportExporter<FORMAT>): PromiseLike<FORMAT> {
        return exporter.exportActivity(this);
    }
}

export class ScenePeriod extends ReportPeriod<Scene> {
    matches(finished: DomainEvent<Outcome<any>>): boolean {
        return this.value.equals(finished.value.subject);
    }

    exportedUsing<FORMAT>(exporter: ReportExporter<FORMAT>): PromiseLike<FORMAT> {
        return exporter.exportScene(this);
    }
}
