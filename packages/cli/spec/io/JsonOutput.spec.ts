import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import type { CliResponse } from '../../src';
import { JsonOutput } from '../../src';

describe('JsonOutput', () => {

    describe('format', () => {

        it('outputs valid JSON to stdout', () => {
            const response: CliResponse<{ message: string }> = {
                success: true,
                data: { message: 'Hello' },
            };

            const output = JsonOutput.format(response);

            expect(() => JSON.parse(output)).to.not.throw();
        });

        it('formats success response correctly', () => {
            const response: CliResponse<{ value: number }> = {
                success: true,
                data: { value: 42 },
            };

            const output = JsonOutput.format(response);
            const parsed = JSON.parse(output);

            expect(parsed.success).to.equal(true);
            expect(parsed.data).to.deep.equal({ value: 42 });
        });

        it('formats error response correctly', () => {
            const response: CliResponse<never> = {
                success: false,
                error: {
                    code: 'TEST_ERROR',
                    message: 'Something went wrong',
                    suggestion: 'Try again',
                },
            };

            const output = JsonOutput.format(response);
            const parsed = JSON.parse(output);

            expect(parsed.success).to.equal(false);
            expect(parsed.error.code).to.equal('TEST_ERROR');
            expect(parsed.error.message).to.equal('Something went wrong');
            expect(parsed.error.suggestion).to.equal('Try again');
        });

        it('supports --pretty flag', () => {
            const response: CliResponse<{ message: string }> = {
                success: true,
                data: { message: 'Hello' },
            };

            const output = JsonOutput.format(response, { pretty: true });

            expect(output).to.include('\n');
            expect(output).to.include('  ');
        });

        it('outputs compact JSON by default', () => {
            const response: CliResponse<{ message: string }> = {
                success: true,
                data: { message: 'Hello' },
            };

            const output = JsonOutput.format(response);

            expect(output).to.not.include('\n');
        });
    });
});
