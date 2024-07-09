import type { OutputStream } from '@serenity-js/core/lib/adapter';

/**
 * A simple abstraction around the standard output stream
 * with support for indenting the printed text.
 */
export class Printer {
    private indentation = new Indentation(2);

    constructor(private readonly stdout: OutputStream = process.stdout) {
    }

    /**
     * Prints the `args` to the `stdout`, followed by a new line character (`\n`).
     *
     * Please note that this method bypasses any indentation as it's intended
     * to be used to print separator lines, etc.
     *
     */
    println(...args: any[]): void {
        return this.print(...args, '\n');
    }

    /**
     * Prints the `args` to the `stdout`, indenting the output according to
     * the current indentation level.
     */
    print(...args: any[]): void {
        this.stdout.write(
            this.indentation.indented(`${ args.map(String).join('') }`),
        );
    }

    /**
     * Increases the current indentation by 2 spaces.
     */
    indent(): void {
        this.indentation.increase();
    }

    /**
     * Reduces the current indentation by 2 spaces.
     */
    outdent(): void {
        this.indentation.decrease();
    }
}

/**
 * @package
 */
class Indentation {
    private current = 0;

    constructor(private readonly step: number) {
    }

    increase() {
        this.current += this.step;
    }

    decrease() {
        if (this.current - this.step >= 0) {
            this.current -= this.step;
        }
    }

    indented(...fragments: string[]) {
        return fragments.join('')
            .split('\n')
            .map(line => line
                ? ' '.repeat(this.current) + line
                : ''
            )
            .join('\n');
    }
}
