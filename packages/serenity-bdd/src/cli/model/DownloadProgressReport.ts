import { JSONData } from '@serenity-js/core/lib/model';

/**
 * An update on the progress of the Serenity BDD jar download.
 */
export class DownloadProgressReport extends JSONData {
    static fromJSON(value: { downloadedBytes: number, totalDownloadedBytes: number, totalBytes: number }): DownloadProgressReport {
        return new DownloadProgressReport(
            Buffer.from(JSON.stringify(value, undefined, 0), 'utf8').toString('base64')
        );
    }
}
