import { match } from 'tiny-types';

import { ArbitraryTag, IssueTag, ManualTag, Tag } from './';

/**
 * @access package
 */
export class Tags {
    private static Pattern = /^@([\w-]+)[:\s]?(.*)/i;

    public static from(text: string): Tag[] {
        const [ , type, val ] = Tags.Pattern.exec(text);

        return match<Tag[]>(type.toLowerCase())
            .when('manual',     _ => [ new ManualTag() ])
            .when(/issues?/,    _ => val.split(',').map(value => new IssueTag(value.trim())))
            .else(value           => [ new ArbitraryTag(value.trim()) ]);
    }
}
