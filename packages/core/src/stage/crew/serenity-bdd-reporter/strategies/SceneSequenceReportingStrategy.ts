import { match } from 'tiny-types';

import {
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    SceneFinished,
    SceneParametersDetected,
    SceneStarts,
    SceneTemplateDetected,
} from '../../../../events';
import { ActivityDetails, ScenarioDetails } from '../../../../model';
import { SceneReport } from '../reports';
import { SceneReportingStrategy } from './SceneReportingStrategy';

/**
 * @access package
 */
export class SceneSequenceReportingStrategy extends SceneReportingStrategy {

    worksFor(anotherScenario: ScenarioDetails): boolean {
        return !! anotherScenario
            && this.scenario.name.equals(anotherScenario.name)             // todo: what about templated scenario names?
            && this.scenario.category.equals(anotherScenario.category)
            && this.scenario.location.path.equals(anotherScenario.location.path);
    }

    handle(event: DomainEvent, report: SceneReport): SceneReport {
        return match<DomainEvent, SceneReport>(event)
            .when(SceneStarts,                      (e: SceneStarts) => {
                return report
                    .activityStarted(this.asActivity(e.value), e.timestamp)
                    .executionStartedAt(e.timestamp);
            })
            .when(SceneTemplateDetected,    (e: SceneTemplateDetected) => {
                return report.withScenarioOutline(e.template);
            })
            .when(SceneParametersDetected,  (e: SceneParametersDetected) => {
                return report.withScenarioParametersOf(e.scenario, e.value);
            })
            .when(ActivityStarts,                   (e: ActivityStarts) => {
                return report.activityStarted(e.value, e.timestamp);
            })
            .when(ActivityFinished,                 (e: ActivityFinished) => {
                return report.activityFinished(e.value, e.outcome, e.timestamp);
            })
            .when(SceneFinished,                    (e: SceneFinished) => {
                return report
                    .activityFinished(this.asActivity(e.value), e.outcome, e.timestamp)
                    .executionFinishedWith(e.value, e.outcome)
                    .executionFinishedAt(e.timestamp);
            })
            .else(e => super.handle(e, report));
    }

    private asActivity(scenario: ScenarioDetails): ActivityDetails {
        return new ActivityDetails(scenario.name);
    }
}
