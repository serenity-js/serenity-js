import type { FileSystem } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import { reportTemplate } from './template.js';

/**
 * Writes the pre-bundled index.html to the output directory.
 *
 * The template is bundled at package compile time by scripts/bundle-template.mjs.
 *
 * @package
 */
export class ReportTemplateWriter {
    constructor(private readonly fileSystem: FileSystem) {
    }

    write(): void {
        this.fileSystem.storeSync(Path.from('index.html'), reportTemplate, 'utf8');
    }
}
