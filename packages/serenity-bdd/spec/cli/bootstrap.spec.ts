import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import { bootstrap } from '../../src/cli/bootstrap';

describe('Serenity BDD CLI', () => {

    it('should tell its version', () => {
        const pkg = require('../../package.json');  // eslint-disable-line @typescript-eslint/no-var-requires

        bootstrap(['--version'], (error, parsed, output) => {
            expect(output).to.equal(pkg.version);
        });
    });
});
