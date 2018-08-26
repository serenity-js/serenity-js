import { Examples } from './Examples';
import { ScenarioDefinition } from './ScenarioDefinition';
import { Tag } from './Tag';

export interface ScenarioOutline extends ScenarioDefinition {
    type: 'ScenarioOutline';
    tags: Tag[];
    examples: Examples[];
}
