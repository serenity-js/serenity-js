import * as cuid from 'cuid';
import { TinyTypeOf } from 'tiny-types';

export class CorrelationId extends TinyTypeOf<string>() {
    static fromJSON(v: string): CorrelationId {
        return new CorrelationId(v);
    }

    static create(): CorrelationId {
        return new CorrelationId(cuid());
    }
}
