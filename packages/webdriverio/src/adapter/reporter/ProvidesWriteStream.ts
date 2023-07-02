import type { OutputStream } from '@serenity-js/core/lib/adapter/index.js';

/**
 * @package
 */
export interface ProvidesWriteStream {
    getWriteStreamObject(reporter: string): OutputStream;
}
