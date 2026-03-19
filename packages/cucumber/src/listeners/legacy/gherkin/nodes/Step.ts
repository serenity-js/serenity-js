import type { ASTNode } from './ASTNode.js';
import type { StepArgument } from './StepArgument.js';

/**
 * @private
 */
export interface Step extends ASTNode {
    type: 'Step';
    keyword: string;
    text: string;
    argument?: StepArgument;
}
