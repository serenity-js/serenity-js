import { serenity } from '@serenity-js/core';
import { consoleReporter } from '@serenity-js/core/lib/reporting/console_reporter';
import { childProcessReporter } from '@serenity-js/integration-testing';

serenity.configure({
    crew: [
        // consoleReporter(),
        childProcessReporter(),
    ],
});
