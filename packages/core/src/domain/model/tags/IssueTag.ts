import { Tag } from './Tag';

export class IssueTag extends Tag {
    constructor(issueId: string) {
        super(issueId, 'issue');
    }
}
