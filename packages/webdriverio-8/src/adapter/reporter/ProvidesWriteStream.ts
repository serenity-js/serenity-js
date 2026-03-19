import type { OutputStream } from '@serenity-js/core/adapter';

/**
 * @package
 */
export interface ProvidesWriteStream {
    getWriteStreamObject(reporter: string): OutputStream;
}
