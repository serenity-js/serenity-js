import { serenity } from 'serenity-js';
import { ChildProcessReporter } from '../spawner/child_process_reporter';

import path = require('path');
import _ = require('lodash');

serenity.configure({
    crew: [new ChildProcessReporter()]
});

export = parsed => require(__dirname + '/../../src/index.ts')({    // tslint:disable-line:no-var-requires
    cwd: path.resolve(__dirname, '..', '..'),
    parameters: _(parsed.options).omitBy(_.isUndefined).omit('version').value(),
}).
run(_(parsed.args).without('').value()).
then(() => {
    process.exit(0);
}, e => {
    console.error(e);
    process.exit(1);
});
