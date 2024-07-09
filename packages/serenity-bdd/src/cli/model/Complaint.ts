import { JSONData } from '@serenity-js/core/lib/model';

/**
 * @package
 */
export class Complaint extends JSONData {
    static fromJSON(value: { description: string, message: string, stack?: string }): Complaint {
        return new Complaint(
            Buffer.from(JSON.stringify(value, undefined, 0), 'utf8').toString('base64')
        );
    }
}
