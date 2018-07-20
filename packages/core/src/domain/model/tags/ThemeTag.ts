import { Tag } from './Tag';

export class ThemeTag extends Tag {
    constructor(theme: string) {
        super(theme, 'theme');
    }
}
