import { Tag } from './Tag';

/**
 * @access public
 */
export class PlatformTag extends Tag {
    static readonly Type = 'platform';

    constructor(platform: string) {
        super(platform, PlatformTag.Type);
    }
}
