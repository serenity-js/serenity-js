/* istanbul ignore file */

import { Comment } from './Comment';
import { Feature } from './Feature';

/**
 * @private
 */
export interface GherkinDocument {
    type: string;
    feature?: Feature;
    comments: Comment[];
}
