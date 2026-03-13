import type { ScenarioDefinition } from './ScenarioDefinition.js';
import type { Tag } from './Tag.js';

/**
 * @private
 */
export interface Scenario extends ScenarioDefinition {
    type: 'Scenario';
    tags: Tag[];
}
