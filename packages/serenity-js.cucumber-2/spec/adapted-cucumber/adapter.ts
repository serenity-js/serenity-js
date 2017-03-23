import { serenity } from 'serenity-js';
import { ChildProcessReporter } from 'serenity-js.testing';

import path = require('path');
import _ = require('lodash');

serenity.assignCrewMembers(new ChildProcessReporter());

export = parsed => require(__dirname + '/../../src/index.ts')({    // tslint:disable-line:no-var-requires
    cwd: path.resolve(__dirname, '..', '..'),
    options: _(parsed.options).omitBy(_.isUndefined).omit('version').value(),
}).
run(_(parsed.args).without('').value()).
then(() => {
    process.exit(0);
}, e => {
    console.error(e);
    process.exit(1);
});
