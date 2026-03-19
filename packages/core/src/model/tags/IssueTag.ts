import { Tag } from './Tag.js';

/**
 * @access public
 */
export class IssueTag extends Tag {
    static readonly Type = 'issue';

    constructor(issueId: string) {
        super(issueId, IssueTag.Type);
    }
}
