import type { DomainEventQueue } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import {
    ActivityFinished,
    ActivityRelatedArtifactArchived,
    ActivityRelatedArtifactGenerated,
    ActivityStarts,
    ActorEntersStage,
    ActorStageExitStarts,
    BusinessRuleDetected,
    FeatureNarrativeDetected,
    RetryableSceneDetected,
    SceneBackgroundDetected,
    SceneDescriptionDetected,
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTagged,
    SceneTemplateDetected,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { match } from 'tiny-types';

import type { SerenityBDD4ReportSchema } from '../../serenity-bdd-report-schema';
import { EventQueueProcessor } from '../EventQueueProcessor';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';
import {
    activityFinished,
    activityStarted,
    executionFinishedAt,
    executionStartedAt,
    reportIdIncluding,
    scenarioDetailsOf
} from '../transformations';
import { SceneSequenceReportContext } from './SceneSequenceReportContext';
import {
    scenarioOutlineOf,
    scenarioParameterResult,
    scenarioParametersOf,
    sceneSequenceOverallResult,
} from './transformations';

/**
 * @package
 */
export class SceneSequenceEventQueueProcessor extends EventQueueProcessor {

    supports(queue: DomainEventQueue): boolean {
        return queue
            && queue.first() instanceof SceneSequenceDetected;
    }

    process(queue: DomainEventQueue): SerenityBDD4ReportSchema {
        return queue.reduce((context, event) =>

            match<DomainEvent, SceneSequenceReportContext>(event)
                .when(SceneSequenceDetected,            this.onSceneSequenceDetected(context))
                .when(RetryableSceneDetected,           this.onRetryableSceneDetected(context))
                .when(SceneStarts,                      this.onSceneStarts(context))
                .when(ActorEntersStage,                 this.onActorEntersStage(context))
                .when(ActorStageExitStarts,             this.onActorStageExitStarts(context))
                .when(SceneTemplateDetected,            this.onSceneTemplateDetected(context))
                .when(SceneParametersDetected,          this.onSceneParametersDetected(context))
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
            new SceneSequenceReportContext(this.requirementsHierarchy)    // eslint-disable-line @stylistic/indent
        ).build();
    }

    private onSceneSequenceDetected<Context extends SerenityBDDReportContext>(context: Context) {
        return (event: SceneSequenceDetected): Context =>
            context
                .with(reportIdIncluding(event.details.category.value, event.details.name.value))
                .with(scenarioDetailsOf(event.details));
    }

    private onRetryableSceneDetected(context: SceneSequenceReportContext) {
        return (event: SceneSequenceDetected): SceneSequenceReportContext =>
            context.usingRetryModeOutcomeReporting();
    }

    private onSceneStarts<Context extends SerenityBDDReportContext>(context: Context) {
        return (event: SceneStarts): Context =>
            context
                .with(activityStarted(event.sceneId, event.details.name, event.timestamp))
                .with(executionStartedAt(event.timestamp));
    }

    private onSceneTemplateDetected(context: SceneSequenceReportContext) {
        return (event: SceneTemplateDetected): SceneSequenceReportContext =>
            context
                .with(scenarioOutlineOf(event.template));
    }

    private onSceneParametersDetected(context: SceneSequenceReportContext) {
        return (event: SceneParametersDetected): SceneSequenceReportContext =>
            context
                .with(scenarioParametersOf(event.details, event.parameters))
    }

    private onActivityStarts<Context extends SerenityBDDReportContext>(context: Context) {
        return (event: ActivityStarts): Context =>
            context
                .with(activityStarted(event.activityId, event.details.name, event.timestamp))
    }

    private onActivityFinished<Context extends SerenityBDDReportContext>(context: Context) {
        return (event: ActivityFinished): Context =>
            context
                .with(activityFinished(event.activityId, event.details.name, event.outcome, event.timestamp))
    }

    private onSceneFinished(context: SceneSequenceReportContext) {
        return (event: SceneFinished): SceneSequenceReportContext =>
            context
                .with(activityFinished(event.sceneId, event.details.name, event.outcome, event.timestamp))
                .with(scenarioParameterResult(event.details, event.outcome))
                .with(sceneSequenceOverallResult(event.outcome))
                .with(executionFinishedAt(event.timestamp))
    }
}
