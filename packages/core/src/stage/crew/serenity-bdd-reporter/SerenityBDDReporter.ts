import { match } from 'tiny-types';

import {
    ActivityFinished,
    ActivityStarts,
    ArtifactGenerated,
    DomainEvent,
    SceneBackgroundDetected,
    SceneDescriptionDetected,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected,
} from '../../../events';
import { Artifact, FileType } from '../../../io';
import { Name, Photo, ScenarioDetails } from '../../../model';
import { StageCrewMember } from '../../StageCrewMember';
import { StageManager } from '../../StageManager';
import { MD5Hash } from './MD5Hash';
import { ScenarioReports } from './ScenarioReports';
import { SerenityBDDReport } from './SerenityBDDJsonSchema';

export class SerenityBDDReporter implements StageCrewMember {
    private readonly reports: ScenarioReports = new ScenarioReports();
    private currentScenario: Current<ScenarioDetails> = new Current(ScenarioDetails);

    private stageManager: StageManager;

    assignTo(stageManager: StageManager) {
        this.stageManager = stageManager;
    }

    notifyOf = (event: DomainEvent): void => match<DomainEvent, void>(event)
        .when(SceneStarts,              this.handleSceneStarts)
        .when(SceneBackgroundDetected,  this.handleSceneBackgroundDetected)
        .when(SceneDescriptionDetected, this.handleSceneDescriptionDetected)
        .when(SceneTagged,              this.handleSceneTagged)
        .when(ActivityStarts,           this.handleActivityStarts)
        .when(ActivityFinished,         this.handleActivityFinished)
        .when(SceneFinished,            this.handleSceneFinished)
        .when(TestRunnerDetected,       this.handleTestRunnerDetected)
        .when(ArtifactGenerated,        this.handleArtifactGenerated)
        .else(_ => void 0)

    private handleSceneStarts = (event: SceneStarts): void => {
        this.currentScenario.value = event.value;
        const report = this.reports.for(this.currentScenario.value)
            .sceneStartedAt(event.timestamp);

        this.reports.save(report);
    }

    private handleSceneBackgroundDetected = (event: SceneBackgroundDetected): void => {
        const report = this.reports.for(this.currentScenario.value)
            .backgroundDetected(event.name, event.description);

        this.reports.save(report);
    }

    private handleSceneDescriptionDetected = (event: SceneDescriptionDetected): void => {
        const report = this.reports.for(this.currentScenario.value)
            .descriptionDetected(event.description);

        this.reports.save(report);
    }

    private handleSceneTagged = (event: SceneTagged): void => {
        const report = this.reports.for(event.value)
            .sceneTaggedWith(event.tag);

        this.reports.save(report);
    }

    private handleActivityStarts = (event: ActivityStarts): void => {
        const report = this.reports.for(this.currentScenario.value)
            .activityStarted(event.value, event.timestamp);

        this.reports.save(report);
    }

    private handleActivityFinished = (event: ActivityFinished): void => {
        const report = this.reports.for(this.currentScenario.value)
            .activityFinished(event.value, event.outcome, event.timestamp);

        this.reports.save(report);
    }

    private handleTestRunnerDetected = (event: TestRunnerDetected): void => {
        const report = this.reports.for(this.currentScenario.value);

        this.reports.save(report.executedBy(event.value),
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
                new Name(MD5Hash.of(JSON.stringify({
                    name: report.name,
                    id: report.id,
                    tags: report.tags,
                })).value),
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
