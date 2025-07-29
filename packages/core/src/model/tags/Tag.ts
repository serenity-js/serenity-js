import { ensure, isDefined, isGreaterThan, property, TinyType } from 'tiny-types';

/**
 * @access public
 */
export abstract class Tag extends TinyType {
    static humanReadable(tagConstructor: new (name: string) => Tag, tagName: string): Tag {
        // based on https://github.com/serenity-bdd/serenity-core/blob/8f7d14c6dad47bb58a1585fef5f9d9a44bb963fd/serenity-model/src/main/java/net/thucydides/core/requirements/AbstractRequirementsTagProvider.java#L36
        const name = String(tagName)
            .trim()
            .match(/[\dA-Z]{2,}(?=[A-Z][a-z]+\d*|\b)|[A-Z]?[a-z-]+\d*|[A-Z]|\d+/g)
            .map(chunk => /^[A-Z]+$/.test(chunk) ? chunk : chunk.toLowerCase())
            .join('_')
            .replaceAll(/[\s_]+/g, ' ')
        ;

        return new tagConstructor(name.charAt(0).toUpperCase() + name.slice(1));
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
