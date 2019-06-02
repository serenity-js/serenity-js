import { createHash } from 'crypto';
import { ensure, isDefined, TinyType } from 'tiny-types';

/**
 * @package
 */
export class MD5Hash extends TinyType {
    static of(value: string): MD5Hash {
        return new MD5Hash(createHash('md5').update(value).digest('hex'));
    }

    constructor(public readonly value: string) {
        super();
        ensure(this.constructor.name, value, isDefined());
    }
}
