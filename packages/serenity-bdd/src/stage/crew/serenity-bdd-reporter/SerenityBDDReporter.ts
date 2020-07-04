import { Stage, StageCrewMember } from '@serenity-js/core';
import { ArtifactGenerated, DomainEvent, SceneSequenceDetected, SceneStarts, TestRunFinishes } from '@serenity-js/core/lib/events';
import { Name, ScenarioDetails, TestReport } from '@serenity-js/core/lib/model';
import { match } from 'tiny-types';

import { Current } from './Current';
import { SceneReport, SceneReports } from './reports';
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

    /**
     * A queue for domain events that took place before the SceneStarts event,
     * for example in Mocha's `before` hook.
     */
    private readonly eventQueue: DomainEvent[] = [];

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
            if (this.shouldChangeStrategyFor(e.value)) {
                this.use(SingleSceneReportingStrategy, e.value);
            }

            const report = this.fetchOrCreateNewReport();

            this.reports.saveInProgress(this.currentStrategy.value.handle(e, report));

            this.drainAnyQueuedEventsAndRecordIn(report);
        })
        .when(TestRunFinishes, _ => {
            this.reports.map(report => this.broadcast(report.toJSON()));
        })
        .else(e => {
            if (this.currentStrategy.isSet()) {
                this.reports.saveInProgress(this.currentStrategy.value.handle(e, this.reports.for(this.currentScenario.value)));
            }
            else {
                this.eventQueue.push(e);
            }
        })

    private fetchOrCreateNewReport() {
        const report = this.reports.for(this.currentScenario.value);

        if (! report.isCompleted()) {
            return report;
        }

        this.reports.saveCompleted(report);

        return this.reports.createReportFor(this.currentScenario.value);
    }

    private drainAnyQueuedEventsAndRecordIn(report: SceneReport) {
        while (this.eventQueue.length > 0) {
            this.reports.saveInProgress(this.currentStrategy.value.handle(
                this.eventQueue.shift(),
                report
            ));
        }
    }

    private shouldChangeStrategyFor(scenario: ScenarioDetails) {
        return ! (this.currentStrategy.isSet() && this.currentStrategy.value.worksFor(scenario));
    }

    private use(strategy: new (sd: ScenarioDetails) => SceneReportingStrategy, scenario: ScenarioDetails) {
        // if (! (this.currentStrategy.isSet() && this.currentStrategy.value.worksFor(scenario))) {
            this.currentStrategy.value = new strategy(scenario);
            this.currentScenario.value = scenario;
        // }
    }

    private broadcast(report: Partial<SerenityBDDReport>) {
        this.stage.announce(new ArtifactGenerated(
            new Name(report.name),
            TestReport.fromJSON(report),
        ));
    }
}
