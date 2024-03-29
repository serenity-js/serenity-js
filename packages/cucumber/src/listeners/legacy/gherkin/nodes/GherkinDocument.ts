import type { Comment } from './Comment';
import type { Feature } from './Feature';

/**
 * @private
 */
export interface GherkinDocument {
    type: string;
    feature?: Feature;
    comments: Comment[];
}
