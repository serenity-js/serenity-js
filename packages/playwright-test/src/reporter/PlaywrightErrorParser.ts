import type { TestError } from '@playwright/test/reporter';

export class PlaywrightErrorParser {
    private static ascii = new RegExp(
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
        'g',
    );

    public errorFrom(testError: TestError): Error {
        const message = testError.message && PlaywrightErrorParser.stripAsciiFrom(testError.message);

        let stack = testError.stack && PlaywrightErrorParser.stripAsciiFrom(testError.stack);

        // TODO: Do I need to process it?
        // const value     = testError.value;

        const prologue = `Error: ${ message }`;
        if (stack && message && stack.startsWith(prologue)) {
            stack = stack.slice(prologue.length);
        }

        if (testError.cause) {
            stack += `\nCaused by: ${ this.errorFrom(testError.cause).stack }`;
        }

        const error = new Error(message);
        error.stack = stack;

        return error;
    }

    private static stripAsciiFrom(text: string): string {
        return text.replace(this.ascii, '');
    }
}
