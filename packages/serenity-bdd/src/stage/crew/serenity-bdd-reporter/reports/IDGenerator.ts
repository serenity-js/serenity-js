import { TinyType } from 'tiny-types';

/** @package */
export class IDGenerator {
    generateFrom(...args: Array<TinyType & { value: string }>) {
        return args.map(arg => this.dashify(arg.value)).join(';');
    }

    private dashify = (text: string) => text
        .replace(/[ \t\W]/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
}
