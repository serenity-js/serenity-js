import { Runner } from 'protractor';
import {
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    Outcome,
    Result,
    Scene,
    SceneFinished,
    SceneStarts,
} from '../../serenity/domain';
import { RehearsalReport } from '../../serenity/reporting';
import { Journal, Stage, StageCrewMember } from '../../serenity/stage';

import { ProtractorReport } from './protractor_report';
import { ProtractorReportExporter } from './protractor_report_exporter';

export class ProtractorReporter implements StageCrewMember {

    private static Events_of_Interest = [ SceneStarts, SceneFinished, ActivityStarts, ActivityFinished ];
    private stage: Stage;
    private journal: Journal          = new Journal();

    constructor(private runner: Runner) {
    }

    assignTo(stage: Stage) {
        this.stage = stage;
        this.stage.manager.registerInterestIn(ProtractorReporter.Events_of_Interest, this);
    }

    notifyOf(event: DomainEvent<any>): void {
        switch (event.constructor.name) { // tslint:disable-line:switch-default - ignore other events
            case SceneStarts.name:      return this.record(event);
            case ActivityStarts.name:   return this.record(event);
            case ActivityFinished.name: return this.record(event);
            case SceneFinished.name:    return this.sceneFinished(event);
        }
    }

    finalResults(): PromiseLike<ProtractorReport> {
        return RehearsalReport.from(this.journal.read()).exportedUsing(new ProtractorReportExporter());
    }

    private sceneFinished(event: SceneFinished): void {
        this.record(event);
        this.notifyProtractor(event.value);
    }

    private record = (event: DomainEvent<any>) => this.journal.record(event);

    private notifyProtractor(outcome: Outcome<Scene>) {
        let result = (outcome.result & Result.Failed)
            ? 'testFail'
            : 'testPass';

        this.runner.emit(result, {
            name: outcome.subject.name,
            category: outcome.subject.category,
        });
    }
}
