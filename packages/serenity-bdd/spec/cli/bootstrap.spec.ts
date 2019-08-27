import 'mocha';

import { expect } from '@integration/testing-tools';
import { bootstrap } from '../../src/cli/bootstrap';

describe('Serenity BDD CLI', () => {

    it('should tell its version', () => {
        const pkg = require('../../package.json');

        bootstrap(['--version'], (error, parsed, output) => {
            expect(output).to.equal(pkg.version);
        });
    });
});
