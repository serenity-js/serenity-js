import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity, StreamReporter } from '@serenity-js/core';

export = function () {

    this.setDefaultTimeout(5000);

    serenity.configure({
        crew: [
            new ChildProcessReporter(),
            new StreamReporter(),
        ],
    });
};
