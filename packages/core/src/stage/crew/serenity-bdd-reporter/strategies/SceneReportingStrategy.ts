import { match } from 'tiny-types';

import {
    ArtifactGenerated,
    DomainEvent,
    FeatureNarrativeDetected,
    SceneBackgroundDetected,
    SceneDescriptionDetected,
    SceneTagged,
    TestRunnerDetected,
} from '../../../../events';
import { Photo, ScenarioDetails } from '../../../../model';
import { SceneReport } from '../reports';

/**
 * @access package
 */
export abstract class SceneReportingStrategy {

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
            .when(ArtifactGenerated,        (e: ArtifactGenerated<any>)     => match<object, SceneReport>(e.artifact.contents)
                .when(Photo, _ => report.photoTaken(e.artifact.name))
                .else(_ => report))
            .else(_ => report);
    }
}
