import { ASTNode } from './ASTNode';

export interface Tag extends ASTNode {
    type: 'Tag';
    name: string;
}
