import type { JSONObject, JSONValue } from 'tiny-types';
import { ensure, isDefined, isString, match } from 'tiny-types';

import { ArbitraryTag } from './ArbitraryTag';
import { BrowserTag } from './BrowserTag';
import { CapabilityTag } from './CapabilityTag';
import { ExecutionRetriedTag } from './ExecutionRetriedTag';
import { FeatureTag } from './FeatureTag';
import { IssueTag } from './IssueTag';
import { ManualTag } from './ManualTag';
import { PlatformTag } from './PlatformTag';
import { ProjectTag } from './ProjectTag';
import type { Tag } from './Tag';
import { ThemeTag } from './ThemeTag';

interface Deserialiser<Return_Type> {
    fromJSON(o: JSONValue): Return_Type;
}

function hasCustomDeserialiser(tagType: any): tagType is Deserialiser<Tag> {
    return Object.prototype.hasOwnProperty.call(tagType, 'fromJSON');
}

/**
 * @package
 */
export class Tags {
    private static readonly supportedTypes: Map<string, Deserialiser<Tag> | { new (name: string): Tag }> = new Map([
        ArbitraryTag,
        BrowserTag,
        CapabilityTag,
        ExecutionRetriedTag,
        FeatureTag,
        IssueTag,
        ManualTag,
        PlatformTag,
        ProjectTag,
        ThemeTag,
    ].map(tagType => [ tagType.Type, tagType ]))

    private static Pattern = /^@([\w-]+)[\s:]?(.*)/i;

    private static matchTags(tagText: string): Tag[] {
        if (tagText === '') {
            return [];
        }

        const [ , tagType, value ] = Tags.Pattern.exec(tagText);

        return match<Tag[]>(tagType.toLowerCase())
            .when('manual', _ => [ new ManualTag() ])
            .when(/^issues?$/, _ => value.split(',').map(value => new IssueTag(value.trim())))
            .else(value => [ new ArbitraryTag(value.trim()) ]);
    }

    static fromJSON(o: JSONObject): Tag {
        const type: string = ensure('serialised tag type', o.type, isDefined(), isString()) as string;

        if (! this.supportedTypes.has(type)) {
            return new ArbitraryTag(o.name as string);
        }

        const found = this.supportedTypes.get(type);

        if (hasCustomDeserialiser(found)) {
            return found.fromJSON(o);
        }

        return new found(o.name as string);
    }

    public static from(text: string): Tag[] {
        const tags = text.split(/\s+/)
            .filter(word => word.startsWith('@'))
            .flatMap(tag => Tags.matchTags(tag));
        return tags ?? Tags.matchTags(text);
    }

    public static stripFrom(text: string): string {
        return text.split(/\s+/)
            .map(word => Tags.Pattern.test(word) ? undefined : word)
            .filter(Boolean)
            .join(' ')
            .trim();
    }
}
