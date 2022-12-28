import { RuntimeError } from '@serenity-js/core';

/**
 * @package
 */
export function formatError(error: RuntimeError | Error): string {

    const learnMore = `Learn more at https://serenity-js.org/handbook/reporting/serenity-bdd-reporter`;

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

        case /"path" argument must be of type string/.test(error.message):
            return lines(
                `Serenity BDD requires a Java Runtime Environment, please make sure you have Java installed.`,
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

function lines(...entries: string[]): string {
    return entries.filter(line => line !== void 0).join('\n');
}
