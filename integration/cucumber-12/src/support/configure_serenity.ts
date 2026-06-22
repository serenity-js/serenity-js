import { setDefaultTimeout } from '@cucumber/cucumber';
import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity, StreamReporter } from '@serenity-js/core';
import { TestRunArchiver } from '@serenity-js/html-reporter';

import { Actors } from './Actors';

setDefaultTimeout(10000);

serenity.configure({
    actors: new Actors(),
    crew: [
        new ChildProcessReporter(),
        new StreamReporter(),
        TestRunArchiver.fromJSON({ outputDirectory: './target/html-report' }),
    ],
});
