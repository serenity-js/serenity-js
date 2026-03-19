import type { ASTNode } from './ASTNode.js';
import type { Step } from './Step.js';
import type { Tag } from './Tag.js';

/**
 * @private
 */
export interface ScenarioDefinition extends ASTNode {
    type: 'Background' | 'Scenario' | 'ScenarioOutline';
    tags: Tag[];
    keyword: string;
    name: string;
    description?: string;
    steps: Step[];
}
