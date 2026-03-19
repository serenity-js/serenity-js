import { Tag } from './Tag.js';

/**
 * @access public
 */
export class FeatureTag extends Tag {
    static readonly Type = 'feature';

    constructor(feature: string) {
        super(feature, FeatureTag.Type);
    }
}
