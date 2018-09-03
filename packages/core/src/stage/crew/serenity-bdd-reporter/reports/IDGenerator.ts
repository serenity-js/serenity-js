import { TinyType, TinyTypeOf } from 'tiny-types';

/** @access package */
export class IDGenerator {
    generateFrom(...args: Array<TinyType & { value: string }>) {
        return args.map(arg => this.dashify(arg.value)).join(';');
    }

    private dashify = (text: string) => text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[ \t\W]/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
}
