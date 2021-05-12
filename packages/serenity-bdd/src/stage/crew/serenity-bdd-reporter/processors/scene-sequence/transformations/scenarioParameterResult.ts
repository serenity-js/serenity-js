import { Outcome, ScenarioDetails } from '@serenity-js/core/lib/model';

import { outcomeReportFrom } from '../../mappers';
import { SceneSequenceReportContext } from '../SceneSequenceReportContext';

export function scenarioParameterResult(scenario: ScenarioDetails, outcome: Outcome) {
    return (context: SceneSequenceReportContext): SceneSequenceReportContext => {

        const index = context.parameters.findIndex(p => p.line === scenario.location.line);

        if (index > -1) {
            const outcomeReport = outcomeReportFrom(outcome);

            context.report.dataTable.rows[index].result = outcomeReport.result;
        }

        return context;
    }
}
