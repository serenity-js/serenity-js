import type { ScenarioParameters } from '@serenity-js/core/model';

/**
 * @package
 */
export interface ScenarioParametersDescriptor {
    parameters: ScenarioParameters;
    line: number;
}
