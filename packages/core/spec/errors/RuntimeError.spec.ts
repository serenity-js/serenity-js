import { beforeEach, describe, it } from 'mocha';

import { RuntimeError } from '../../src/errors';
import { expect } from '../expect';

describe('RuntimeError', () => {

    describe('subclass', () => {

        class CustomError extends RuntimeError {
            constructor(message: string) {
                super(CustomError, message);
            }
        }

        let error: RuntimeError;

        beforeEach(() => {
            error = new CustomError('something happened');
        });

        it('is recognised as an instance of its type', () => {
            expect(error).to.be.instanceOf(Error);
            expect(error).to.be.instanceOf(RuntimeError);
            expect(error).to.be.instanceOf(CustomError);
        });

        it('has a message', () => {
            expect(error.message).to.equal('something happened');
        });

        it('retains the stacktrace', () => {
            const frames = error.stack.split('\n');

            expect(frames[0]).to.equal('CustomError: something happened');
            expect(frames[1]).to.contain(__filename);
        });
    });

    describe('when propagating errors', () => {

        class ApplicationError extends RuntimeError {
            constructor(message: string, cause?: Error) {
                super(ApplicationError, message, cause);
            }
        }

        class IOError extends RuntimeError {
            constructor(message: string, cause?: Error) {
                super(IOError, message, cause);
            }
        }

        it('includes the stack trace of the original errors', () => {

            const fsError  = new Error('ENOENT: no such file or directory');
            const ioError  = new IOError(`Directory not writable`, fsError);
            const appError = new ApplicationError('Report could not be saved', ioError);

            const significantFrames = appError.stack.split('\n').filter(frame => ! frame.startsWith('    '));

            expect(significantFrames).to.deep.equal([
                'ApplicationError: Report could not be saved; Directory not writable; ENOENT: no such file or directory',
                'Caused by: IOError: Directory not writable; ENOENT: no such file or directory',
                'Caused by: Error: ENOENT: no such file or directory',
            ]);
        });
    });
});
