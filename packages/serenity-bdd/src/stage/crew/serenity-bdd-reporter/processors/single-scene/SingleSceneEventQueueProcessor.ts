import { match } from 'tiny-types';
import {
    ActivityFinished,
    ActivityRelatedArtifactArchived,
    ActivityRelatedArtifactGenerated,
    ActivityStarts,
    BusinessRuleDetected,
    DomainEvent,
    FeatureNarrativeDetected,
    SceneBackgroundDetected,
    SceneDescriptionDetected,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';

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
        return queue.reduce((context, event) =>
            match<DomainEvent, SingleSceneReportContext>(event)
                .when(SceneStarts,                      this.onSceneStarts(context))
                .when(FeatureNarrativeDetected,         this.onFeatureNarrativeDetected(context))
                .when(SceneBackgroundDetected,          this.onSceneBackgroundDetected(context))
                .when(SceneDescriptionDetected,         this.onSceneDescriptionDetected(context))
                .when(BusinessRuleDetected,             this.onBusinessRuleDetected(context))
                .when(TestRunnerDetected,               this.onTestRunnerDetected(context))
                .when(SceneTagged,                      this.onSceneTagged(context))
                .when(ActivityStarts,                   this.onActivityStarts(context))
                .when(ActivityFinished,                 this.onActivityFinished(context))
                .when(ActivityRelatedArtifactGenerated, this.onActivityRelatedArtifactGenerated(context))
                .when(ActivityRelatedArtifactArchived,  this.onActivityRelatedArtifactArchived(context))
                .when(SceneFinished,                    this.onSceneFinished(context))
                .else(() => context),
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
