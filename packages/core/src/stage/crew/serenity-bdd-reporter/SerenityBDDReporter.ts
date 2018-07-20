import { match } from 'tiny-types';

import { StageCrewMember, StageManager } from '../..';
import {
    ActivityBegins,
    ActivityFinished,
    ArtifactGenerated,
    DomainEvent,
    ExecutionContextPropertyDetected,
    Name,
    Photo,
    ScenarioDetails,
    SceneBegins,
    SceneFinished,
    SceneTagged,
    TestRunnerType,
} from '../../../domain';
import { Artifact, FileType } from '../../../io';
import { MD5Hash } from './MD5Hash';
import { ScenarioReport } from './ScenarioReport';
import { ScenarioReports } from './ScenarioReports';
import { SerenityBDDReport } from './SerenityBDDJsonSchema';

export class SerenityBDDReporter implements StageCrewMember {
    private readonly reports: ScenarioReports = new ScenarioReports();
    private currentScenario: Current<ScenarioDetails> = new Current(ScenarioDetails);

    private stageManager: StageManager;

    assignTo(stageManager: StageManager) {
        this.stageManager = stageManager;
        this.stageManager.register(this);
    }

    notifyOf = (event: DomainEvent): void => match<DomainEvent, void>(event)
        .when(SceneBegins,      this.handleSceneBegins)
        .when(SceneTagged,      this.handleSceneTagged)
        .when(ActivityBegins,   this.handleActivityBegins)
        .when(ActivityFinished, this.handleActivityFinished)
        .when(SceneFinished,    this.handleSceneFinished)
        .when(ExecutionContextPropertyDetected, this.handleExecutionContextPropertyDetected)
        .when(ArtifactGenerated, this.handleArtifactGenerated)
        .else(_ => void 0)

    private handleSceneBegins = (event: SceneBegins): void => {
        this.currentScenario.value = event.value;
        const report = this.reports.for(this.currentScenario.value)
            .sceneStartedAt(event.timestamp);

        this.reports.save(report);
    }

    private handleSceneTagged = (event: SceneTagged): void => {
        const report = this.reports.for(event.value)
            .sceneTaggedWith(event.tag);

        this.reports.save(report);
    }

    private handleActivityBegins = (event: ActivityBegins): void => {
        const report = this.reports.for(this.currentScenario.value)
            .activityBegan(event.value, event.timestamp);

        this.reports.save(report);
    }

    private handleActivityFinished = (event: ActivityFinished): void => {
        const report = this.reports.for(this.currentScenario.value)
            .activityFinished(event.value, event.outcome, event.timestamp);

        this.reports.save(report);
    }

    private handleExecutionContextPropertyDetected = (event: ExecutionContextPropertyDetected<any>): void => {
        const report = this.reports.for(event.scenarioDetails);

        this.reports.save(match<any, ScenarioReport>(event.value)
            .when(TestRunnerType, (val: TestRunnerType) => report.executedBy(val))
            .else(_ => report),
        );
    }

    private handleArtifactGenerated = (event: ArtifactGenerated<any>): void => {
        return match<object, void>(event.artifact.contents)
            .when(Photo, _ => {
                const report = this.reports.for(this.currentScenario.value)
                    .photoTaken(event.artifact.name);

                this.reports.save(report);
            })
            .else(_ => void 0);
    }

    private handleSceneFinished = (event: SceneFinished): void => {
        const report = this.reports.for(event.value).
            sceneFinishedAt(event.timestamp).
            executionFinishedWith(event.outcome);

        this.reports.save(report);

        this.currentScenario.clear();

        this.broadcast(report.toJSON());
    }

    private broadcast(report: Partial<SerenityBDDReport>) {
        this.stageManager.notifyOf(new ArtifactGenerated(
            new Artifact(
                new Name(MD5Hash.of(JSON.stringify(report)).value),
                FileType.JSON,
                report,
            ),
        ));
    }
}

class Current<T> {
    constructor(private readonly type: { new(...args: any[]): T }, private val: T = null) {
    }

    set value(value: T) {
        this.val = value;
    }

    get value() {
        return this.val;
    }

    clear() {
        this.val = null;
    }
}
