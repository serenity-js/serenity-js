/* istanbul ignore file */

import { ScenarioDefinition } from './ScenarioDefinition';
import { Tag } from './Tag';

/**
 * @private
 */
export interface Scenario extends ScenarioDefinition {
    type: 'Scenario';
    tags: Tag[];
}
