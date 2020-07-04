import { Stage, StageCrewMember } from '@serenity-js/core';
import { ArtifactGenerated, DomainEvent, SceneSequenceDetected, SceneStarts, TestRunFinishes } from '@serenity-js/core/lib/events';
import { Name, ScenarioDetails, TestReport } from '@serenity-js/core/lib/model';
import { match } from 'tiny-types';

import { Current } from './Current';
import { SceneReport, SceneReports } from './reports';
import { SerenityBDDReport } from './SerenityBDDJsonSchema';
import { SceneReportingStrategy, SceneSequenceReportingStrategy, SingleSceneReportingStrategy } from './strategies';

/**
 * @desc
 *  Produces [Serenity BDD](http://serenity-bdd.info/)-standard JSON reports
 *  that [Serenity BDD CLI Reporter](https://github.com/serenity-bdd/serenity-cli)
 *  can parse to produce HTML reports and living documentation.
 *
 * @example <caption>Registering the reporter programmatically</caption>
 *  import { ArtifactArchiver, serenity } from '@serenity-js/core';
 *  import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
 *
 *  serenity.configure({
 *    crew: [
 *      ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *      new SerenityBDDReporter()
 *    ],
 *  });
 *
 * @example <caption>Registering the reporter using Protractor configuration</caption>
 *  // protractor.conf.js
 *  const
 *    { ArtifactArchiver }    = require('@serenity-js/core'),
 *    { SerenityBDDReporter } = require('@serenity-js/serenity-bdd');
 *
 *  exports.config = {
 *    framework:     'custom',
 *    frameworkPath: require.resolve('@serenity-js/protractor/adapter'),
 *
 *    serenity: {
 *      crew: [
 *        ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *        new SerenityBDDReporter(),
 *      ],
 *      // other Serenity/JS config
 *    },
 *
 *    // other Protractor config
 *  };
 *
 * @public
 * @implements {@serenity-js/core/lib/stage~StageCrewMember}
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

    /**
     * @param {@serenity-js/core/lib/stage~Stage} [stage=null] stage
     */
    constructor(private readonly stage: Stage = null) {
    }

    /**
     * @desc
     *  Creates a new instance of this {@link @serenity-js/core/lib/stage~StageCrewMember}
     *  and assigns it to a given {@link @serenity-js/core/lib/stage~Stage}.
     *
     * @see {@link @serenity-js/core/lib/stage~StageCrewMember}
     *
     * @param {@serenity-js/core/lib/stage~Stage} stage - An instance of a {@link @serenity-js/core/lib/stage~Stage} this {@link @serenity-js/core/lib/stage~StageCrewMember} will be assigned to
     * @returns {@serenity-js/core/lib/stage~StageCrewMember} - A new instance of this {@link @serenity-js/core/lib/stage~StageCrewMember}
     */
    assignedTo(stage: Stage): StageCrewMember {
        return new SerenityBDDReporter(stage);
    }

    /**
     * @desc
     *  Handles {@link @serenity-js/core/lib/events~DomainEvent} objects emitted by the {@link @serenity-js/core/lib/stage~StageCrewMember}.
     *
     * @see {@link @serenity-js/core/lib/stage~StageCrewMember}
     *
     * @param {@serenity-js/core/lib/events~DomainEvent} event
     * @returns {void}
     */
    notifyOf (event: DomainEvent): void {
        return match<DomainEvent, void>(event)
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
                } else {
                    this.eventQueue.push(e);
                }
            });
    }

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
        this.currentStrategy.value = new strategy(scenario);
        this.currentScenario.value = scenario;
    }

    private broadcast(report: Partial<SerenityBDDReport>) {
        this.stage.announce(new ArtifactGenerated(
            new Name(report.name),
            TestReport.fromJSON(report),
        ));
    }
}
