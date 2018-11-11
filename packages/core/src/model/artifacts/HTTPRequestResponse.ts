import { JSONObject } from 'tiny-types';
import { JSONData } from './JSONData';

export interface RequestAndResponse extends JSONObject {
    request: {
        url: string;
        method: string;
        headers: { [header: string]: string };
        data?: any;
    };
    response: {
        status: number;
        data?: any;
        headers?: { [header: string]: string };
    };
}

export class HTTPRequestResponse extends JSONData {
    static fromJSON(value: RequestAndResponse) {
        return new HTTPRequestResponse(Buffer.from(JSON.stringify(value, null, 0), 'utf8').toString('base64'));
    }
}
