import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import SerenityBDDReporter from '../src';

describe('SerenityBDDReporter', () => {

    it('offers a default export with a no-arg factory function', () => {
        const reporter = SerenityBDDReporter();
        expect(reporter.assignedTo).to.be.a('function');
    });
});
