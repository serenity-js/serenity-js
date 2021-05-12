/* eslint-disable unicorn/filename-case */
/* istanbul ignore file */

import { Location } from './Location';

/**
 * @private
 */
export interface ASTNode {
    type: string;
    location: Location;
}
