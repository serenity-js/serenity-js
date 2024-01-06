import type { ScenarioDetails, ScenarioParameters } from '@serenity-js/core/lib/model';

import type { DataTableDataSetDescriptorSchema, DataTableSchema } from '../../../serenity-bdd-report-schema';
import type { SceneSequenceReportContext } from '../SceneSequenceReportContext';

export function scenarioParametersOf(scenario: ScenarioDetails, parameters: ScenarioParameters): (context: SceneSequenceReportContext) => SceneSequenceReportContext {

    function descriptorFor(dataTable: DataTableSchema) {
        const parameterSetDescription = parameters.description && parameters.description.value;

        const existingDescriptor: DataTableDataSetDescriptorSchema = dataTable.dataSetDescriptors
            .find(descriptor => descriptor.name === parameters.name.value && descriptor.description === parameterSetDescription);

        if (existingDescriptor) {
            return existingDescriptor;
        }

        const newDescriptor = {
            name:           parameters.name.value,
            description:    parameters.description && parameters.description.value,
            startRow:       dataTable.dataSetDescriptors.reduce((acc, current) => acc + current.rowCount, 0),
            rowCount:       0,
        };

        dataTable.dataSetDescriptors.push(newDescriptor);

        return newDescriptor;
    }

    return (context: SceneSequenceReportContext): SceneSequenceReportContext => {

        const headers = Object.keys(parameters.values);

        const dataTable: DataTableSchema = context.report.dataTable;

        dataTable.headers = headers;

        descriptorFor(dataTable).rowCount++;

        context.report.dataTable.rows.push({
            values: Object.values(parameters.values),
        });

        context.parameters.push({ parameters, line: scenario.location.line });

        return context;
    }
}
