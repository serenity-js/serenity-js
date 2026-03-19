import type { ASTNode } from './ASTNode.js';
import type { TableRow } from './TableRow.js';
import type { Tag } from './Tag.js';

/**
 * @private
 */
export interface Examples extends ASTNode {
    type: 'Examples';
    tags: Tag[];
    keyword: string;
    name: string;
    description: string;
    tableHeader: TableRow;
    tableBody: TableRow[];
}
