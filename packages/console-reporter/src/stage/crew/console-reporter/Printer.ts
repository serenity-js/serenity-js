import WritableStream = NodeJS.WritableStream;

/**
 * @package
 */
export class Printer {
    private indentation = new Indentation(2);

    constructor(private readonly stdout: WritableStream = process.stdout) {

    }

    println(...args: any[]) {
        return this.print(...args, '\n');
    }

    print(...args: any[]) {
        this.stdout.write(
            this.indentation.indented(`${ args.map(String).join('') }`),
        );
    }

    indent() {
        this.indentation.increase();
    }

    outdent() {
        this.indentation.decrease();
    }
}

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
            .map(line => !! line ? ' '.repeat(this.current) + line : '')
            .join('\n');
    }
}
