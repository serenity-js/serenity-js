import type { ScenarioDefinition } from './ScenarioDefinition.js';

/**
 * @private
 */
export interface Background extends ScenarioDefinition {
    type: 'Background';
}
