import 'mocha';

import { expect } from '@integration/testing-tools';

import { UnsupportedOperationError } from '../src/errors';

describe('Unsupported operation error', () => {
    it('has default message', () => {
        expect(() => {
            throw new UnsupportedOperationError();
        }).to.throw('This operation is not supported in playwright connector.');
    });

    it('appends arg to message', () => {
        expect(() => {
            throw new UnsupportedOperationError('Use another one instead');
        }).to.throw(
            'This operation is not supported in playwright connector. Use another one instead'
        );
    });
});
