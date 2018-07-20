import { Tag } from './Tag';

export class BrowserTag extends Tag {
    constructor(browser: string) {
        super(browser, 'browser');
    }
}
