import { ASTNode } from './ASTNode';
import { ScenarioDefinition } from './ScenarioDefinition';
import { Tag } from './Tag';

export interface Feature extends ASTNode {
    type: 'Feature';
    tags: Tag[];
    language: string;
    keyword: string;
    name: string;
    description: string;
    children: ScenarioDefinition[];
}
