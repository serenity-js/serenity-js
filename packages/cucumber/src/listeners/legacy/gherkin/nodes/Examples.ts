/* istanbul ignore file */

import { ASTNode } from './ASTNode';
import { TableRow } from './TableRow';
import { Tag } from './Tag';

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
