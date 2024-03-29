import type { ASTNode } from './ASTNode';
import type { ScenarioDefinition } from './ScenarioDefinition';
import type { Tag } from './Tag';

/**
 * @private
 */
export interface Feature extends ASTNode {
    type: 'Feature';
    tags: Tag[];
    language: string;
    keyword: string;
    name: string;
    description: string;
    children: ScenarioDefinition[];
}
