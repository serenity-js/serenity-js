import type { ASTNode } from './ASTNode.js';

/**
 * @private
 */
export interface Comment extends ASTNode {
    type: 'Comment';
    text: string;
}
