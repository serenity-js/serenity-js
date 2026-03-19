import type { Description } from '@serenity-js/core/model';

import type { SceneSequenceReportContext } from '../SceneSequenceReportContext';

export function scenarioOutlineOf(outline: Description) {
    return (context: SceneSequenceReportContext): SceneSequenceReportContext => {
        context.report.dataTable = context.report.dataTable || {
            scenarioOutline: outline.value,
            dataSetDescriptors: [],
            headers: [],
            rows: [],
            predefinedRows: true,
        };

        return context;
    }
}
