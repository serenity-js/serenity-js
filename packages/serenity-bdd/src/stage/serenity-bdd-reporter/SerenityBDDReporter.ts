import { Stage, StageCrewMember } from '@serenity-js/core';
import { ArtifactGenerated, DomainEvent, SceneSequenceDetected, SceneStarts, TestRunFinished } from '@serenity-js/core/lib/events';
import { Name, ScenarioDetails, TestReport } from '@serenity-js/core/lib/model';
import { match } from 'tiny-types';

import { Current } from './Current';
import { SceneReports } from './reports';
import { SerenityBDDReport } from './SerenityBDDJsonSchema';
import { SceneReportingStrategy, SceneSequenceReportingStrategy, SingleSceneReportingStrategy } from './strategies';

/**
 * @desc Produces Serenity BDD-standard JSON reports.
 * @see http://serenity-bdd.info/
 *
 * @access public
 */
export class SerenityBDDReporter implements StageCrewMember {
    private readonly reports: SceneReports = new SceneReports();
    private currentScenario = new Current<ScenarioDetails>();
    private currentStrategy = new Current<SceneReportingStrategy>();

    constructor(private readonly stage: Stage = null) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new SerenityBDDReporter(stage);
    }

    notifyOf = (event: DomainEvent): void => match<DomainEvent, void>(event)
        .when(SceneSequenceDetected, (e: SceneSequenceDetected) => {
            this.use(SceneSequenceReportingStrategy, e.value);
        })
        .when(SceneStarts, (e: SceneStarts) => {
            this.use(SingleSceneReportingStrategy, e.value);

            this.reports.save(this.currentStrategy.value.handle(e, this.reports.for(this.currentScenario.value)));
        })
        .when(TestRunFinished, _ => {
            this.reports.map(report => this.broadcast(report.toJSON()));
        })
        .else(e => {
            if (this.currentStrategy.isSet()) {
                this.reports.save(this.currentStrategy.value.handle(e, this.reports.for(this.currentScenario.value)));
            }
        })

    private use(strategy: new (sd: ScenarioDetails) => SceneReportingStrategy, scenario: ScenarioDetails) {
        if (! (this.currentStrategy.isSet() && this.currentStrategy.value.worksFor(scenario))) {
            this.currentStrategy.value = new strategy(scenario);
            this.currentScenario.value = scenario;
        }
    }

    private broadcast(report: Partial<SerenityBDDReport>) {
        this.stage.announce(new ArtifactGenerated(
            new Name(report.name),
            TestReport.fromJSON(report),
        ));
    }
}
