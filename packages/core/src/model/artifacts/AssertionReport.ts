import { JSONData } from './JSONData';

export class AssertionReport extends JSONData {
    static fromJSON(value: { expected: string, actual: string }): AssertionReport {
        return new AssertionReport(Buffer.from(JSON.stringify(value, undefined, 0), 'utf8').toString('base64'));
    }
}
