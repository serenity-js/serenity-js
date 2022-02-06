import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity, StreamReporter } from '@serenity-js/core';
import { defineSupportCode } from 'cucumber';

import { Actors } from './Actors';

defineSupportCode(({ setDefaultTimeout }) => {
    serenity.configure({
        actors: new Actors(),
        crew: [
            new ChildProcessReporter(),
            new StreamReporter(),
        ],
    });

    setDefaultTimeout(10000);
});
