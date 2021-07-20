
import { UnsupportedOperationError } from '../src/errors';
import { chai } from './chai-extra';

chai.should();

describe('Unsupported operation error', () => {
    it('has default message', () => {
        (() => {
            throw new UnsupportedOperationError();
        }).should.throw('This operation is not supported in playwright connector.');
    });

    it('appends arg to message', () => {
        (() => {
            throw new UnsupportedOperationError('Use another one instead');
        }).should.throw(
            'This operation is not supported in playwright connector. Use another one instead'
        );
    });
});
