import type { ASTNode } from './ASTNode.js';

/**
 * @private
 */
export interface StepArgument extends ASTNode {
    type: 'DataTable' | 'DocString';
}
