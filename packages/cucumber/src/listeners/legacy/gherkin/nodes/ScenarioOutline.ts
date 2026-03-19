import type { Examples } from './Examples.js';
import type { ScenarioDefinition } from './ScenarioDefinition.js';
import type { Tag } from './Tag.js';

/**
 * @private
 */
export interface ScenarioOutline extends ScenarioDefinition {
    type: 'ScenarioOutline';
    tags: Tag[];
    examples: Examples[];
}
