import { JSONObject } from 'tiny-types';
import { JSONData } from './JSONData';

export class TestReport extends JSONData {
    static fromJSON(value: JSONObject) {
        return new TestReport(Buffer.from(JSON.stringify(value, null, 0), 'utf8').toString('base64'));
    }
}
