import { OutputStream } from '@serenity-js/core/lib/io';

/**
 * @package
 */
export interface ProvidesWriteStream {
    getWriteStreamObject(reporter: string): OutputStream;
}
