import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity, StreamReporter } from '@serenity-js/core';
import { setDefaultTimeout } from 'cucumber';

import { Actors } from './Actors';

setDefaultTimeout(10000);

serenity.configure({
    actors: new Actors(),
    crew: [
        new ChildProcessReporter(),
        new StreamReporter(),
    ],
});
