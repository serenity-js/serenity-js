import {
    ActivityFinished,
    ActivityRelatedArtifactArchived,
    ActivityRelatedArtifactGenerated,
    ActivityStarts,
    DomainEvent,
    FeatureNarrativeDetected,
    SceneBackgroundDetected,
    SceneDescriptionDetected,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { match } from 'tiny-types';

import { SerenityBDDReport } from '../../SerenityBDDJsonSchema';
import { EventQueue } from '../EventQueue';
import { EventQueueProcessor } from '../EventQueueProcessor';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';
import { activityFinished, activityStarted, executionFinishedAt, executionFinishedWith, executionStartedAt, reportIdIncluding, scenarioDetailsOf } from '../transformations';
import { SingleSceneReportContext } from './SingleSceneReportContext';

/**
 * @package
 */
export class SingleSceneEventQueueProcessor extends EventQueueProcessor {

    supports(queue: EventQueue): boolean {
        return queue
            && queue.first() instanceof SceneStarts;
    }

    process(queue: EventQueue): SerenityBDDReport {
        return queue.reduce((report, event) =>
            match<DomainEvent, SingleSceneReportContext>(event)
                .when(SceneStarts,                      this.onSceneStarts(report))
                .when(FeatureNarrativeDetected,         this.onFeatureNarrativeDetected(report))
                .when(SceneBackgroundDetected,          this.onSceneBackgroundDetected(report))
                .when(SceneDescriptionDetected,         this.onSceneDescriptionDetected(report))
                .when(TestRunnerDetected,               this.onTestRunnerDetected(report))
                .when(SceneTagged,                      this.onSceneTagged(report))
                .when(ActivityStarts,                   this.onActivityStarts(report))
                .when(ActivityFinished,                 this.onActivityFinished(report))
                .when(ActivityRelatedArtifactGenerated, this.onActivityRelatedArtifactGenerated(report))
                .when(ActivityRelatedArtifactArchived,  this.onActivityRelatedArtifactArchived(report))
                .when(SceneFinished,                    this.onSceneFinished(report))
                .else(() => report),
            new SingleSceneReportContext()
        ).build();
    }

    private onSceneStarts(report: SerenityBDDReportContext) {
        return (event: SceneStarts) =>
            report
                .with(reportIdIncluding(event.details.category.value, event.details.name.value))
                .with(scenarioDetailsOf(event.details))
                .with(executionStartedAt(event.timestamp));
    }

    private onActivityStarts(report: SerenityBDDReportContext) {
        return (event: ActivityStarts) =>
            report
                .with(activityStarted(event.activityId, event.details.name, event.timestamp))
    }

    private onActivityFinished(report: SerenityBDDReportContext) {
        return (event: ActivityFinished) =>
            report
                .with(activityFinished(event.activityId, event.outcome, event.timestamp))
    }

    private onSceneFinished(report: SerenityBDDReportContext) {
        return (event: SceneFinished) =>
            report
                .with(executionFinishedWith(event.outcome))
                .with(executionFinishedAt(event.timestamp))
    }
}

