// todo: remove in favour of index.ts?

import { adapterForCucumber, requireFrom } from './adapters';

const cucumberVersion = requireFrom(process.cwd(), 'cucumber/package').version.split('.').map(v => parseInt(v, 10))[0];
const cucumber = requireFrom(process.cwd(), 'cucumber');

export = adapterForCucumber(cucumberVersion, cucumber);
