import { DomainEventQueue } from '@serenity-js/core';
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
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTagged,
    SceneTemplateDetected,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { match } from 'tiny-types';

import { SerenityBDDReport } from '../../SerenityBDDJsonSchema';
import { EventQueueProcessor } from '../EventQueueProcessor';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';
import { activityFinished, activityStarted, executionFinishedAt, executionStartedAt, reportIdIncluding, scenarioDetailsOf } from '../transformations';
import { SceneSequenceReportContext } from './SceneSequenceReportContext';
import { scenarioOutlineOf, sceneSequenceOverallResult } from './transformations';
import { scenarioParameterResult } from './transformations/scenarioParameterResult';
import { scenarioParametersOf } from './transformations/scenarioParametersOf';

/**
 * @package
 */
export class SceneSequenceEventQueueProcessor extends EventQueueProcessor {

    supports(queue: DomainEventQueue): boolean {
        return queue
            && queue.first() instanceof SceneSequenceDetected;
    }

    process(queue: DomainEventQueue): SerenityBDDReport {
        return queue.reduce((context, event) =>
            // eslint-disable-next-line @typescript-eslint/indent
            match<DomainEvent, SceneSequenceReportContext>(event)
                .when(SceneSequenceDetected,            this.onSceneSequenceDetected(context))
                .when(SceneStarts,                      this.onSceneStarts(context))
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
            new SceneSequenceReportContext()    // eslint-disable-line @typescript-eslint/indent
        ).build();
    }

    private onSceneSequenceDetected<Context extends SerenityBDDReportContext>(context: Context) {
        return (event: SceneSequenceDetected): Context =>
            context
                .with(reportIdIncluding(event.details.category.value, event.details.name.value))
                .with(scenarioDetailsOf(event.details));
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
                .with(activityFinished(event.activityId, event.outcome, event.timestamp))
    }

    private onSceneFinished(context: SceneSequenceReportContext) {
        return (event: SceneFinished): SceneSequenceReportContext =>
            context
                .with(activityFinished(event.sceneId, event.outcome, event.timestamp))
                .with(scenarioParameterResult(event.details, event.outcome))
                .with(sceneSequenceOverallResult(event.outcome))
                .with(executionFinishedAt(event.timestamp))
    }
}
