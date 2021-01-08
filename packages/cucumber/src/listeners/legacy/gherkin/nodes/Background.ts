/* istanbul ignore file */

import { ScenarioDefinition } from './ScenarioDefinition';

/**
 * @private
 */
export interface Background extends ScenarioDefinition {
    type: 'Background';
}
