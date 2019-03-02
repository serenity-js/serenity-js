import { JSONData } from './JSONData';

export class TextData extends JSONData {
    static fromJSON(value: { contentType: string, data: string }) {
        return new TextData(Buffer.from(JSON.stringify(value, null, 0), 'utf8').toString('base64'));
    }
}
