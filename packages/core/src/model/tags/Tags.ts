import { match } from 'tiny-types';

import { ArbitraryTag, IssueTag, ManualTag, Tag } from './';

/**
 * @package
 */
export class Tags {
    private static Pattern = /^@([\w-]+)[\s:]?(.*)/i ;

    public static from(text: string): Tag[] {
        const [ , type, value ] = Tags.Pattern.exec(text);

        return match<Tag[]>(type.toLowerCase())
            .when('manual',     _ => [ new ManualTag() ])
            // todo: map as arbitrary tag if value === ''; look up ticket id
            .when(/^issues?$/,  _ => value.split(',').map(value => new IssueTag(value.trim())))
            .else(value           => [ new ArbitraryTag(value.trim()) ]);
    }
}
