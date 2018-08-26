import { ASTNode } from './ASTNode';

export interface Comment extends ASTNode {
    type: 'Comment';
    text: string;
}
