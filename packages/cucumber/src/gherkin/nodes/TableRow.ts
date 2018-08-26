import { ASTNode } from './ASTNode';
import { TableCell } from './TableCell';

export interface TableRow extends ASTNode {
    type: 'TableRow';
    cells: TableCell[];
}
