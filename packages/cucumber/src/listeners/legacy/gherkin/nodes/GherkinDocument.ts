import type { Comment } from './Comment.js';
import type { Feature } from './Feature.js';

/**
 * @private
 */
export interface GherkinDocument {
    type: string;
    feature?: Feature;
    comments: Comment[];
}
