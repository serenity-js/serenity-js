import { ensure, isDefined, isGreaterThan, isString, JSONObject, property, TinyType } from 'tiny-types';

import * as TagTypes from './index';

/**
 * @access public
 */
export abstract class Tag extends TinyType {
    static fromJSON(o: JSONObject): Tag {
        const type: string = ensure('serialised tag type', o.type, isDefined(), isString()) as string;

        const found = Object.keys(TagTypes).find(t => TagTypes[t].Type === type) || TagTypes.ArbitraryTag.name;

        if (Object.prototype.hasOwnProperty.call(TagTypes[found], 'fromJSON')) {
            return TagTypes[found].fromJSON(o);
        }

        return new TagTypes[found](o.name);
    }

    protected constructor(public readonly name: string, public readonly type: string) {
        super();

        ensure('Tag name', name, isDefined(), property('length', isGreaterThan(0)));
        ensure('Tag type', type, isDefined(), property('length', isGreaterThan(0)));
    }

    toJSON(): { name: string, type: string } {
        return super.toJSON() as { name: string, type: string };
    }
}
