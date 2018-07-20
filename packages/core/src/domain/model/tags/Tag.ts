import { TinyType } from 'tiny-types';

export abstract class Tag extends TinyType {
    protected constructor(public readonly name: string, public readonly type: string) {
        super();
    }

    toJSON(): { name: string, type: string } {
        return super.toJSON() as { name: string, type: string };
    }
}
