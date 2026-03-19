import type { ASTNode } from './ASTNode.js';

/**
 * @private
 */
export interface TableCell extends ASTNode {
    value: string;
}
