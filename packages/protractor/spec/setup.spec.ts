import 'mocha';

import { configure } from '@serenity-js/core';
import { UIActors } from './UIActors';

beforeEach(() => {
    configure({ actors: new UIActors() });
});
