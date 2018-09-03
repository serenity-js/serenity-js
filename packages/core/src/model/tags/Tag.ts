import { ensure, isDefined, isString, Serialised, TinyType } from 'tiny-types';
import * as TagTypes from './index';

/**
 * @access public
 */
export abstract class Tag extends TinyType {
    static fromJSON(o: Serialised<Tag>) {
        const type: string = ensure('serialised tag type', o.type, isDefined(), isString()) as string;

        const found = Object.keys(TagTypes).find(t => TagTypes[t].Type === type) || TagTypes.ArbitraryTag.name;

        return new TagTypes[found](o.name);
    }

    protected constructor(public readonly name: string, public readonly type: string) {
        super();
    }

    toJSON(): { name: string, type: string } {
        return super.toJSON() as { name: string, type: string };
    }
}
