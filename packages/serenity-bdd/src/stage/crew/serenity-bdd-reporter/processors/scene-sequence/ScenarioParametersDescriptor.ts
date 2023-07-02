import type { ScenarioParameters } from '@serenity-js/core/lib/model';

/**
 * @package
 */
export interface ScenarioParametersDescriptor {
    parameters: ScenarioParameters;
    line: number;
}
