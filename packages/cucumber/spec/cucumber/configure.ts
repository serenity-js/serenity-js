import { serenity } from '@serenity-js/core';
import { childProcessReporter } from '@serenity-js/integration-testing';

export = function() {

    serenity.configure({
        crew: [
            childProcessReporter(),
        ],
    });
}