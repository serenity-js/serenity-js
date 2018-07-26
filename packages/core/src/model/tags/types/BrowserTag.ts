import { Tag } from '../Tag';

export class BrowserTag extends Tag {
    static readonly Type = 'browser';

    constructor(browser: string) {
        super(browser, BrowserTag.Type);
    }
}
