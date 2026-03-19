import type { ASTNode } from './ASTNode.js';
import type { ScenarioDefinition } from './ScenarioDefinition.js';
import type { Tag } from './Tag.js';

/**
 * @private
 */
export interface Feature extends ASTNode {
    type: 'Feature';
    tags: Tag[];
    language: string;
    keyword: string;
    name: string;
    description?: string;
    children: ScenarioDefinition[];
}
