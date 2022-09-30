import { DomainEventQueue } from '@serenity-js/core';
import {
    ActivityRelatedArtifactArchived,
    ActivityRelatedArtifactGenerated,
    BusinessRuleDetected,
    FeatureNarrativeDetected,
    SceneBackgroundDetected,
    SceneDescriptionDetected,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';

import { SerenityBDDReport } from '../SerenityBDDJsonSchema';
import { SerenityBDDReportContext } from './SerenityBDDReportContext';
import { activityRelatedArtifact, archivedActivityRelatedArtifact, backgroundOf, businessRuleOf, descriptionOf, featureNarrativeOf, tagOf, testRunnerCalled } from './transformations';

/**
 * @package
 */
export abstract class EventQueueProcessor {
    abstract supports(queue: DomainEventQueue): boolean;
    abstract process(queue: DomainEventQueue): SerenityBDDReport;  // todo: return Artifact with a name instead

    protected onFeatureNarrativeDetected<Context extends SerenityBDDReportContext>(report: Context) {
        return (event: FeatureNarrativeDetected): Context =>
            report
                .with(featureNarrativeOf(event.description));
    }

    protected onSceneBackgroundDetected<Context extends SerenityBDDReportContext>(report: Context) {
        return (event: SceneBackgroundDetected): Context =>
            report
                .with(backgroundOf(event.name, event.description));
    }

    protected onSceneDescriptionDetected<Context extends SerenityBDDReportContext>(report: Context) {
        return (event: SceneDescriptionDetected): Context =>
            report
                .with(descriptionOf(event.description))
    }

    protected onTestRunnerDetected<Context extends SerenityBDDReportContext>(report: Context) {
        return (event: TestRunnerDetected): Context =>
            report
                .with(testRunnerCalled(event.name));
    }

    protected onSceneTagged<Context extends SerenityBDDReportContext>(report: Context) {
        return (event: SceneTagged): Context =>
            report
                .with(tagOf(event.tag))
    }

    protected onBusinessRuleDetected<Context extends SerenityBDDReportContext>(report: Context) {
        return (event: BusinessRuleDetected): Context =>
            report
                .with(businessRuleOf(event.rule))
    }

    protected onActivityRelatedArtifactGenerated<Context extends SerenityBDDReportContext>(report: Context) {
        return (event: ActivityRelatedArtifactGenerated): Context =>
            report
                .with(activityRelatedArtifact(event.activityId, event.name, event.artifact, event.timestamp))
    }

    protected onActivityRelatedArtifactArchived<Context extends SerenityBDDReportContext>(report: Context) {
        return (event: ActivityRelatedArtifactArchived): Context =>
            report
                .with(archivedActivityRelatedArtifact(event.activityId, event.type, event.path, event.timestamp))
    }
}
