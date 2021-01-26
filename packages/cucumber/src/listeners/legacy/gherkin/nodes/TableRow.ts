/* istanbul ignore file */

import { ASTNode } from './ASTNode';
import { TableCell } from './TableCell';

/**
 * @private
 */
export interface TableRow extends ASTNode {
    type: 'TableRow';
    cells: TableCell[];
}
