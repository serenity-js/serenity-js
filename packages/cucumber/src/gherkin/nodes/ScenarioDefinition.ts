import { ASTNode } from './ASTNode';
import { Step } from './Step';
import { Tag } from './Tag';

export interface ScenarioDefinition extends ASTNode {
    type: 'Background' | 'Scenario' | 'ScenarioOutline';
    tags: Tag[];
    keyword: string;
    name: string;
    description: string;
    steps: Step[];
}
