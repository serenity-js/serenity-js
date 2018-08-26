import { ASTNode } from './ASTNode';
import { Comment } from './Comment';
import { Feature } from './Feature';

export interface GherkinDocument extends ASTNode {
    feature: Feature;
    comments: Comment[];
}
