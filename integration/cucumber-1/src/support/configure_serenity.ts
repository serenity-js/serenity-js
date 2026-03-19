import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity, StreamReporter } from '@serenity-js/core';

import { Actors } from './Actors';

// Cucumber 1.x expects support files to export a function
export = function () {

    serenity.configure({
        actors: new Actors(),
        crew: [
            new ChildProcessReporter(),
            new StreamReporter(),
        ],
    });

    this.setDefaultTimeout(10000);
};
