import { ASTNode } from './ASTNode';

export interface StepArgument extends ASTNode {
    type: 'DataTable' | 'DocString';
}
