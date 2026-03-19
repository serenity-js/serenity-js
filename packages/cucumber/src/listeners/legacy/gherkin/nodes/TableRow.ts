import type { ASTNode } from './ASTNode.js';
import type { TableCell } from './TableCell.js';

/**
 * @private
 */
export interface TableRow extends ASTNode {
    type: 'TableRow';
    cells: TableCell[];
}
