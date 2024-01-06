import { ExecutionSuccessful } from '@serenity-js/core/lib/model';

import type { SerenityBDD4ReportSchema } from '../../serenity-bdd-report-schema';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';
import type { ScenarioParametersDescriptor } from './ScenarioParametersDescriptor';

/**
 * @package
 */
export class SceneSequenceReportContext extends SerenityBDDReportContext {
    public readonly parameters: ScenarioParametersDescriptor[] = [];
    public readonly worstOutcomeSoFar = new ExecutionSuccessful();

    build(): SerenityBDD4ReportSchema {
        const report = super.build();

        this.parameters.forEach((entry, index) => {
            const values = entry.parameters.values;
            const sceneDescription = Object.keys(values).map(key => `${ key }: ${ values[key] }`).join(', ').trim();

            report.testSteps[index].description += ` #${ index + 1 } - ${ sceneDescription }`;
        });

        return report;
    }
}
