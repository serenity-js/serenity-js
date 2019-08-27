import { JSONData } from '@serenity-js/core/lib/model';

/**
 * @desc
 *  An issue to be reported to the user.
 *
 * @package
 */
export class Complaint extends JSONData {
    static fromJSON(value: { description: string, message: string, stack?: string }) {
        return new Complaint(Buffer.from(JSON.stringify(value, null, 0), 'utf8').toString('base64'));
    }
}
