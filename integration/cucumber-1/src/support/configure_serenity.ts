import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity, StreamReporter } from '@serenity-js/core';

import { Actors } from './Actors';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
