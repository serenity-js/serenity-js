import { ChildProcessReporter } from '@integration/testing-tools';
import { Cast, serenity, StreamReporter } from '@serenity-js/core';

serenity.configure({
    actors: Cast.whereEveryoneCan(/* do nothing much */),
    crew: [
        new ChildProcessReporter(),
        new StreamReporter(process.stdout),
    ],
});
