import { Artifact } from '../Artifact';

export class Photo extends Artifact {
    static fromBase64(value: string) {
        return new Photo(value);
    }

    static fromBuffer(value: Buffer | ArrayBuffer) {
        const buffer = value instanceof ArrayBuffer
            ? Buffer.from(value)
            : value;

        return Photo.fromBase64(buffer.toString('base64'));
    }

    map<O>(fn: (decodedValue: Buffer) => O): O {
        return fn(Buffer.from(this.base64EncodedValue, 'base64'));
    }
}
