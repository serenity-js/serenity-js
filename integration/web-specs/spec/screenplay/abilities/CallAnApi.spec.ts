import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';

describe('CallAnApi', () => {

    it('is available to all the actors', () => {
        const callAnApi = CallAnApi.as(actorCalled('Bernie'));

        expect(callAnApi).to.be.instanceOf(CallAnApi);
    });
});
