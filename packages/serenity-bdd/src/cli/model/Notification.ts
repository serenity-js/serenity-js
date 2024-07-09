import { JSONData } from '@serenity-js/core/lib/model';

/**
 * An information that the user should be notified about.
 *
 * @package
 */
export class Notification extends JSONData {
    static fromJSON(value: { message: string }): Notification {
        return new Notification(
            Buffer.from(JSON.stringify(value, undefined, 0), 'utf8').toString('base64')
        );
    }
}
