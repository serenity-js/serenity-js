import { ASTNode } from './ASTNode';
import { Step } from './Step';

export interface ScenarioDefinition extends ASTNode {
    type: 'Background' | 'Scenario' | 'ScenarioOutline';
    keyword: string;
    name: string;
    description: string;
    steps: Step[];
}
