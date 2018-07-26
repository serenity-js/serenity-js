import { ScenarioDetails } from '../../../model';
import { IDGenerator } from './IDGenerator';
import { ScenarioReport } from './ScenarioReport';

export class ScenarioReports {
    private static idGenerator = new IDGenerator();
    private readonly reports: { [entryId: string]: ScenarioReport } = {};

    for(scenarioDetails: ScenarioDetails): ScenarioReport {
        if (! this.alreadyHasAReportFor(scenarioDetails)) {
            return this.createReportFor(scenarioDetails);
        }

        return this.reportFor(scenarioDetails);
    }

    save(scenarioReport: ScenarioReport) {
        this.reports[this.correlationIdFor(scenarioReport.scenarioDetails)] = scenarioReport;
    }

    private alreadyHasAReportFor(scenarioDetails: ScenarioDetails): boolean {
        return !! this.reports[this.correlationIdFor(scenarioDetails)];
    }

    private reportFor(scenarioDetails: ScenarioDetails): ScenarioReport {
        return this.reports[this.correlationIdFor(scenarioDetails)];
    }

    private createReportFor(scenarioDetails: ScenarioDetails): ScenarioReport {
        return new ScenarioReport(scenarioDetails);
    }

    private correlationIdFor(scenarioDetails: ScenarioDetails): string {
        return ScenarioReports.idGenerator.generateFrom(
            scenarioDetails.category,
            scenarioDetails.name,
            scenarioDetails.location.path,
        );
    }
}
