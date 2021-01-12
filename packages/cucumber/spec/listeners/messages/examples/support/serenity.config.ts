import { ChildProcessReporter } from '@integration/testing-tools';
import { Cast, configure, StreamReporter } from '@serenity-js/core';

configure({
    actors: Cast.whereEveryoneCan(/* do nothing much */),
    crew: [
        new ChildProcessReporter(),
        new StreamReporter(process.stdout),
    ],
});
