import { JSONData } from '@serenity-js/core/lib/model';

/**
 * @desc
 *  An update on the progress of the Serenity BDD jar download.
 *
 * @package
 */
export class DownloadProgressReport extends JSONData {
    static fromJSON(value: { downloadedBytes: number, totalDownloadedBytes: number, totalBytes: number }) {
        return new DownloadProgressReport(Buffer.from(JSON.stringify(value, null, 0), 'utf8').toString('base64'));
    }
}
