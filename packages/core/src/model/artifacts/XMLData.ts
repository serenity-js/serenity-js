import { Artifact } from '../Artifact';

export class XMLData extends Artifact {
    static fromString(value: string): XMLData {
        return new XMLData(Buffer.from(value).toString('base64'));
    }

    static fromBuffer(value: Buffer): XMLData {
        return new XMLData(value.toString('base64'));
    }

    map<T>(fn: (decodedValue: Buffer) => T): T {
        return fn(Buffer.from(this.base64EncodedValue, 'base64'));
    }
}
