import type { ASTNode } from './ASTNode.js';

/**
 * @private
 */
export interface Tag extends ASTNode {
    type: 'Tag';
    name: string;
}
