import { match } from 'tiny-types';

import type { Tag } from './';
import { ArbitraryTag, IssueTag, ManualTag } from './';

/**
 * @package
 */
export class Tags {
    private static Pattern = /^@([\w-]+)[\s:]?(.*)/i;

    private static matchTags(tagText: string): Tag[] {
        if (tagText === '') return [];
        const [, type, value] = Tags.Pattern.exec(tagText);

        return match<Tag[]>(type.toLowerCase())
            .when('manual', _ => [new ManualTag()])
            // todo: map as arbitrary tag if value === ''; look up ticket id
            .when(/^issues?$/, _ => value.split(',').map(value => new IssueTag(value.trim())))
            .else(value => [new ArbitraryTag(value.trim())])
    }

    public static from(text: string): Tag[] {
        const tags = text.split(/\s+/)
            .filter(word => word.startsWith('@'))
            .flatMap(tag => Tags.matchTags(tag));
        return tags ?? Tags.matchTags(text); 
    }
}
