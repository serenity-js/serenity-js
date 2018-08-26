import { ASTNode } from './ASTNode';
import { StepArgument } from './StepArgument';

export interface Step extends ASTNode {
    type: 'Step';
    keyword: string;
    text: string;
    argument?: StepArgument;
}
