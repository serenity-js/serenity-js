import { TinyType, TinyTypeOf } from 'tiny-types';

export class Name extends TinyTypeOf<string>() {
    static fromJSON(v: string) {
        return new Name(v);
    }
}
