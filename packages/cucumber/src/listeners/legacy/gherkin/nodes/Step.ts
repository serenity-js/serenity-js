/* istanbul ignore file */

import { ASTNode } from './ASTNode';
import { StepArgument } from './StepArgument';

/**
 * @private
 */
export interface Step extends ASTNode {
    type: 'Step';
    keyword: string;
    text: string;
    argument?: StepArgument;
}
