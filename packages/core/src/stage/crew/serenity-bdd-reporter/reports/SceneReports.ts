import { ScenarioDetails } from '../../../../model';
import { IDGenerator } from './IDGenerator';
import { SceneReport } from './SceneReport';

/** @access package */
export class SceneReports {
    private static idGenerator = new IDGenerator();
    private readonly reports: { [entryId: string]: SceneReport } = {};

    for(scenarioDetails: ScenarioDetails): SceneReport {
        if (! this.alreadyHasAReportFor(scenarioDetails)) {
            return this.createReportFor(scenarioDetails);
        }

        return this.reportFor(scenarioDetails);
    }

    save(scenarioReport: SceneReport) {
        this.reports[this.correlationIdFor(scenarioReport.scenarioDetails)] = scenarioReport;
    }

    map<T>(fn: (report: SceneReport) => T): T[] {
        return Object.keys(this.reports).map(correlationId => this.reports[correlationId]).map(fn);
    }

    private alreadyHasAReportFor(scenarioDetails: ScenarioDetails): boolean {
        return !! this.reports[this.correlationIdFor(scenarioDetails)];
    }

    private reportFor(scenarioDetails: ScenarioDetails): SceneReport {
        return this.reports[this.correlationIdFor(scenarioDetails)];
    }

    private createReportFor(scenarioDetails: ScenarioDetails): SceneReport {
        return new SceneReport(scenarioDetails);
    }

    private correlationIdFor(scenarioDetails: ScenarioDetails): string {
        return SceneReports.idGenerator.generateFrom(
            scenarioDetails.category,
            scenarioDetails.name,
            scenarioDetails.location.path,      // todo: should this include the line?
        );
    }
}
