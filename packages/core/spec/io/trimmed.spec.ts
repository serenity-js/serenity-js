import { describe, it } from 'mocha';

import { trimmed } from '../../src/io';
import { expect } from '../expect';

class Example {
    toString(): string {
        return 'example';
    }
}

describe ('`trimmed` tag function', () => {

    it('trims the leading and trailing whitespace', () => {
        expect(trimmed `  Hello world!  `).to.equal('Hello world!');
    });

    it('supports values that can be converted to string', () => {
        expect(trimmed `string: ${ 'hello' }, number: ${ 42 }, object: ${ new Example() }`)
            .to.equal('string: hello, number: 42, object: example');
    });

    it('leaves the space between the lines if required', () => {
        expect(trimmed `
            | --------------------------------------------------------------------------------
            | features/payments/checkout.feature
            |
            | Online Checkout: Paying with a default card
            |
            | ✓ Execution successful (10ms)
        `).to.equal([
            '--------------------------------------------------------------------------------',
            'features/payments/checkout.feature',
            '',
            'Online Checkout: Paying with a default card',
            '',
            '✓ Execution successful (10ms)',
        ].join('\n'));
    });

    it('trims padded multi-line string', () => {
        expect(trimmed `
            | const SomeInteraction = () =>
            |     Interaction.where(\`${ '#actor interacts with the system' }\`, (actor: Actor) => {
            |         // use actor's abilities to interact with the system under test
            |     });
        `).to.equal([
            `const SomeInteraction = () =>`,
            `    Interaction.where(\`#actor interacts with the system\`, (actor: Actor) => {`,
            `        // use actor's abilities to interact with the system under test`,
            `    });`,
        ].join('\n'));
    });
});
