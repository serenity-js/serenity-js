import { ScenarioDefinition } from './ScenarioDefinition';
import { Tag } from './Tag';

export interface Scenario extends ScenarioDefinition {
    type: 'Scenario';
    tags: Tag[];
}
