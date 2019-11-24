import { JSONData } from './JSONData';

export class AssertionReport extends JSONData {
    static fromJSON(value: { expected: string, actual: string }) {
        return new AssertionReport(Buffer.from(JSON.stringify(value, null, 0), 'utf8').toString('base64'));
    }
}
