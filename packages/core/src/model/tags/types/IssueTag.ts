import { Tag } from '../Tag';

export class IssueTag extends Tag {
    static readonly Type = 'issue';

    constructor(issueId: string) {
        super(issueId, IssueTag.Type);
    }
}
