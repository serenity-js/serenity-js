import 'mocha';

import { trimmed } from '../../src/io';
import { expect } from '../expect';

describe ('`trimmed` tag function', () => {

    /** @test {trimmed} */
    it('trims the leading and trailing whitespace', () => {
        expect(trimmed `  Hello world!  `).to.equal('Hello world!');
    });

    /** @test {trimmed} */
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
            '',
        ].join('\n'));
    });

    /** @test {trimmed} */
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
            ``,
        ].join('\n'));
    });
});
