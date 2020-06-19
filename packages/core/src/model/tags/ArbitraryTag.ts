import { Tag } from './Tag';

/**
 * @desc
 *  Tagged with an arbitrary tag that doesn't have any special interpretation
 *  such as @regression, @wip, etc.
 *
 * @access public
 */
export class ArbitraryTag extends Tag {
    static readonly Type = 'tag';

    constructor(value: string) {
        super(value, ArbitraryTag.Type);
    }
}
