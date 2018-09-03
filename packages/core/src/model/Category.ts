import { TinyType, TinyTypeOf } from 'tiny-types';

export class Category extends TinyTypeOf<string>() {
    static fromJSON(v: string) {
        return new Category(v);
    }
}
