import {
    ActivityRelatedArtifactArchived,
    ArtifactGenerated,
    DomainEvent,
    FeatureNarrativeDetected,
    SceneBackgroundDetected,
    SceneDescriptionDetected,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { AssertionReportDiffer } from '@serenity-js/core/lib/io';
import { Artifact, ArtifactType, AssertionReport, HTTPRequestResponse, JSONData, LogEntry, Photo, ScenarioDetails, TextData } from '@serenity-js/core/lib/model';
import { match } from 'tiny-types';
import { SceneReport } from '../reports';

/**
 * @package
 */
export abstract class SceneReportingStrategy {

    private static readonly differ = new AssertionReportDiffer({
        expected: line => `+ ${ line }`,
        actual:   line => `- ${ line }`,
        matching: line => `  ${ line }`,
    });

    constructor(protected readonly scenario: ScenarioDetails) {
    }

    abstract worksFor(anotherScenario: ScenarioDetails): boolean;

    handle(event: DomainEvent, report: SceneReport): SceneReport {
        return match<DomainEvent, SceneReport>(event)
            .when(FeatureNarrativeDetected, (e: FeatureNarrativeDetected)   => report.withFeatureNarrativeOf(e.description))
            .when(SceneBackgroundDetected,  (e: SceneBackgroundDetected)    => report.withBackgroundOf(e.name, e.description))
            .when(SceneDescriptionDetected, (e: SceneDescriptionDetected)   => report.withDescriptionOf(e.description))
            .when(SceneTagged,              (e: SceneTagged)                => report.taggedWith(e.tag))
            .when(TestRunnerDetected,       (e: TestRunnerDetected)         => report.executedBy(e.value))
            // todo: those should be activity-related artifacts, since they're collected by the actor
            .when(ArtifactGenerated,        (e: ArtifactGenerated)          => match<Artifact, SceneReport>(e.artifact)
                .when(HTTPRequestResponse,  _ => report.httpRequestCaptured(e.artifact.map(data => data)))
                .when(TextData,             _ => report.arbitraryDataCaptured(e.name, e.artifact.map(artifactContents => artifactContents.data), e.timestamp))
                .when(LogEntry,             _ => report.arbitraryDataCaptured(e.name, e.artifact.map(artifactContents => artifactContents.data), e.timestamp))
                .when(AssertionReport,      _ =>
                    report.arbitraryDataCaptured(
                        e.name,
                        e.artifact.map(artifactContents =>
                            SceneReportingStrategy.differ.diff(artifactContents.expected, artifactContents.actual),
                        ),
                        e.timestamp,
                    ),
                )
                .when(JSONData,             _ =>
                    report.arbitraryDataCaptured(
                        e.name,
                        e.artifact.map(artifactContents => JSON.stringify(artifactContents, null, 4)),
                        e.timestamp,
                    ),
                )
                .else(_ => report))
            .when(ActivityRelatedArtifactArchived, (e: ActivityRelatedArtifactArchived) => match<ArtifactType, SceneReport>(e.type)
                .when(Photo,                _ => report.photoTaken(e.details, e.path, e.timestamp))
                .else(_ => report))
            .else(_ => report);
    }
}
