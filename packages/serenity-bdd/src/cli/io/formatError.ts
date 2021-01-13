import { RuntimeError } from '@serenity-js/core';

/**
 * @package
 */
export function formatError(error: RuntimeError | Error) {

    const learnMore = `Learn more at https://serenity-js.org/modules/serenity-bdd`;

    switch (true) {
        case /ETIMEDOUT/.test(error.message):
            return lines(
                `Are you behind a proxy or a firewall that needs to be configured?`,
                ...messages(error),
                '',
                learnMore,
            );

        case /self signed certificate in certificate chain/.test(error.message):
            return lines(
                `If you're using a self-signed certificate please check if it's configured correctly or use the --ignoreSSL option.`,
                '',
                learnMore,
            );

        case error instanceof RuntimeError:
            return lines(
                ...messages(error),
                '',
                learnMore
            );

        default:
            return lines(
                `I'm terribly sorry, but something didn't go according to plan:`,
                ...messages(error),
            );
    }
}

function messages(error: RuntimeError | Error, acc: string[] = []): string[] {
    return error.message && (error as RuntimeError).cause
        ? messages((error as RuntimeError).cause, acc.concat(error.message))
        : acc.concat(error.message || `${ error }`);
}

function lines(...entries: string[]) {
    return entries.filter(line => line !== void 0).join('\n');
}
