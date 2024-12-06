import type { OutputStream } from '@serenity-js/core/lib/adapter/index.js';

/**
 * @package
 */
export class OutputStreamBuffer implements OutputStream {
    private buffer = '';

    constructor(private readonly prefix: string) {
    }

    write(content: string): void {
        this.buffer += content;
    }

    hasContent(): boolean {
        return this.buffer !== '';
    }

    flush(): string {
        const prefixedContent = this.buffer
            .split('\n')
            .map(line => `${ this.prefix } ${ line }\n`)
            .join('');

        this.buffer = '';

        return prefixedContent;
    }
}
