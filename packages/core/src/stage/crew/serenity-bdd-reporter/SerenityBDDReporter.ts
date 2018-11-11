import { match } from 'tiny-types';

import { ArtifactGenerated, DomainEvent, SceneSequenceDetected, SceneStarts, TestRunFinished } from '../../../events';
import { Name, ScenarioDetails, TestReport } from '../../../model';
import { StageCrewMember } from '../../StageCrewMember';
import { StageManager } from '../../StageManager';
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

    private stageManager: StageManager;

    assignTo(stageManager: StageManager) {
        this.stageManager = stageManager;
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
            this.reports.save(this.currentStrategy.value.handle(e, this.reports.for(this.currentScenario.value)));
        })

    private use(strategy: { new (sd: ScenarioDetails): SceneReportingStrategy }, scenario: ScenarioDetails) {
        if (! (this.currentStrategy.isSet() && this.currentStrategy.value.worksFor(scenario))) {
            this.currentStrategy.value = new strategy(scenario);
            this.currentScenario.value = scenario;
        }
    }

    private broadcast(report: Partial<SerenityBDDReport>) {
        this.stageManager.notifyOf(new ArtifactGenerated(
            new Name('scenario-report'),
            TestReport.fromJSON(report),
        ));
    }
}
