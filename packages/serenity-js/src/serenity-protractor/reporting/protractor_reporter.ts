import {
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    Identifiable,
    Outcome,
    RecordedScene,
    Result,
    SceneFinished,
    SceneStarts,
} from '@serenity-js/core/lib/domain';
import { JSONObject } from '@serenity-js/core/lib/io/json';
import {
    ActivityPeriod,
    RehearsalPeriod,
    RehearsalReport,
    ReportExporter,
    ScenePeriod,
} from '@serenity-js/core/lib/reporting';
import { Journal, Stage, StageCrewMember } from '@serenity-js/core/lib/stage';
import { Runner } from 'protractor';

import { ProtractorActivityReport, ProtractorReport, ProtractorSceneReport } from './protractor_report';

export class ProtractorReporter implements StageCrewMember {

    private static Events_of_Interest = [ SceneStarts, SceneFinished ];
    private stage: Stage = null;
    private journal: Journal          = new Journal();

    private timing: {[key: string]: number} = {};

    constructor(private runner: Runner) {
    }

    assignTo(stage: Stage) {
        this.stage = stage;
        this.stage.manager.registerInterestIn(ProtractorReporter.Events_of_Interest, this);
    }

    notifyOf(event: DomainEvent<any>): void {
        switch (event.constructor.name) { // tslint:disable-line:switch-default - ignore other events
            case SceneStarts.name:      return this.sceneStarts(event);
            case ActivityStarts.name:   return this.record(event);
            case ActivityFinished.name: return this.record(event);
            case SceneFinished.name:    return this.sceneFinished(event);
        }
    }

    finalResults(): PromiseLike<ProtractorReport> {
        return RehearsalReport.from(this.journal.read()).exportedUsing(new ProtractorReportExporter());
    }

    private sceneStarts<T extends Identifiable>(event: DomainEvent<T>) {
        this.record(event);
        this.timing[event.value.id] = event.timestamp;
    }

    private sceneFinished(event: SceneFinished): void {
        this.record(event);
        this.notifyProtractor(event.value, event.timestamp - this.timing[event.value.subject.id]);
    }

    private record = (event: DomainEvent<any>) => this.journal.record(event);

    private notifyProtractor(outcome: Outcome<RecordedScene>, duration: number) {
        const result = (outcome.result & Result.Failed)
            ? 'testFail'
            : 'testPass';

        this.runner.emit(result, {
            name: outcome.subject.name,
            category: outcome.subject.category,
            durationMillis: duration,
        });
    }
}

/**
 * Transforms the tree structure of the RehearsalPeriod to a format acceptable by Protractor
 */
export class ProtractorReportExporter implements ReportExporter<JSONObject> {

    constructor(private passing: (r: Result) => boolean = (r: Result) => ! (r & Result.Failed)) {
    }

    exportRehearsal(node: RehearsalPeriod): PromiseLike<ProtractorReport> {
        return Promise.all(node.children.map(child => child.exportedUsing(this)))
            .then(children => ({
                failedCount: node.children.filter(period => ! this.passing(period.outcome.result)).length,
                specResults: children,
            }));
    }

    exportScene(node: ScenePeriod): PromiseLike<ProtractorSceneReport> {
        return Promise.all(node.children.map(child => child.exportedUsing(this)))
            .then(children => ({
                description: node.value.name,
                assertions:  children,
                duration:    node.duration(),
            }));
    }

    exportActivity(node: ActivityPeriod): PromiseLike<ProtractorActivityReport> {
        // we only export top-level activities as Protractor doesn't care about the nested ones
        return Promise.resolve({
            passed:     this.passing(node.outcome.result),
            errorMsg:   node.outcome.error && node.outcome.error.message,
            stackTrace: node.outcome.error && node.outcome.error.stack,
        });
    }
}
