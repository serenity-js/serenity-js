import { actorCalled, Log } from '@serenity-js/core';
import { describe, it } from 'mocha';

describe('Mocha', () => {

    describe('A scenario', () => {

        it('performs an interaction', () =>
            actorCalled('Alice').attemptsTo(
                Log.the('Hello'),
            ));
    });
});
