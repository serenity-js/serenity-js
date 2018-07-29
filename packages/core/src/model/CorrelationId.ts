import * as cuid from 'cuid';
import { TinyType, TinyTypeOf } from 'tiny-types';

export class CorrelationId extends TinyTypeOf<string>() {
    static fromJSON(v: string) {
        return new CorrelationId(v);
    }

    static create() {
        return new CorrelationId(cuid());
    }
}
