import type { Location } from './Location.js';

/**
 * @private
 */
export interface ASTNode {
    type: string;
    location: Location;
}
