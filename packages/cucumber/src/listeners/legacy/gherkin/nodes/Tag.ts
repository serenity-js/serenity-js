/* istanbul ignore file */

import { ASTNode } from './ASTNode';

/**
 * @private
 */
export interface Tag extends ASTNode {
    type: 'Tag';
    name: string;
}
