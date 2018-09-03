import { createHash } from 'crypto';
import { TinyType, TinyTypeOf } from 'tiny-types';

/**
 * @access package
 */
export class MD5Hash extends TinyTypeOf<string>() {
    static of(value: string): MD5Hash {
        return new MD5Hash(createHash('md5').update(value).digest('hex'));
    }
}
