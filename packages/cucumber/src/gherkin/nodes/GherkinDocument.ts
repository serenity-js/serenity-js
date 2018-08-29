import { Comment } from './Comment';
import { Feature } from './Feature';

export interface GherkinDocument {
    type: string;
    feature?: Feature;
    comments: Comment[];
}
