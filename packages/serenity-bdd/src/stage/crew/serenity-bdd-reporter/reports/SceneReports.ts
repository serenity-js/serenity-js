import { ScenarioDetails } from '@serenity-js/core/lib/model';
import { SceneReport } from './SceneReport';
import { SceneReportId } from './SceneReportId';

/** @package */
export class SceneReports {
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
        return new SceneReportId(scenarioDetails.category.value)
            .append(scenarioDetails.name.value)
            .append(scenarioDetails.location.path.value)    // todo: should this include the line?
            .value;
    }
}
