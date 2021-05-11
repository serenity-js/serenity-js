import { ensure, Predicate, TinyType } from 'tiny-types';

/**
 * @package
 */
export class Credentials extends TinyType {

    static fromString(value: string): Credentials {
        if (! value) {
            return new Credentials(undefined, undefined);
        }

        ensure('Credentials', value, matches(/(.*):(.*)/, `follow the "<username>:<password>" format`));

        const index = value.indexOf(':');

        return new Credentials(
            value.slice(0, index),
            value.slice(index + 1)
        )
    }

    constructor(
        public readonly username: string,
        public readonly password: string,
    ) {
        super();
    }
}

/**
 * @package
 */
function matches(expression: RegExp, description?: string): Predicate<string> {
    return Predicate.to(description || `match pattern ${ expression }`, (value: string) => expression.test(value));
}
