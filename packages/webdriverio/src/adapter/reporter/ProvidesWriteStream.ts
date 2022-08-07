import { OutputStream } from '@serenity-js/core/lib/adapter';

/**
 * @package
 */
export interface ProvidesWriteStream {
    getWriteStreamObject(reporter: string): OutputStream;
}
