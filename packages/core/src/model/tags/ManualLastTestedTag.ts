import { Tag } from './Tag';

/**
 * @access public
 */
export class ManualLastTestedTag extends Tag {
    private readonly lastTested;
    static readonly Type = 'External Test Time';

    constructor(lastTested: string) {
        super(lastTested, ManualLastTestedTag.Type);
        this.lastTested = lastTested;
    }
    getLastTested(): string {
        return this.lastTested;
    }
}
