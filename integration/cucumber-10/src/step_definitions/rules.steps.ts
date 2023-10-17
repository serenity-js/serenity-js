import { DataTable, defineParameterType, Given, Then } from '@cucumber/cucumber';
import { Actor, actorCalled, actorInTheSpotlight } from '@serenity-js/core';

defineParameterType({
    regexp: /[A-Z][a-z]+/,
    transformer(name: string) {
        return actorCalled(name);
    },
    name: 'actor',
});

defineParameterType({
    regexp: /he|she|they|his|her|their/,
    transformer() {
        return actorInTheSpotlight();
    },
    name: 'pronoun',
});

Given('the following Frequent Flyer members:', (table: DataTable) => {
    return void 0;
});

Given('the following Frequent Flyer account balances:', (table: DataTable) => {
    return void 0;
});

Given('{actor} transfers {int} points to {actor}', (sender: Actor, points: number, receiver: Actor) => {
    return void 0;
});

Given('{actor} tries to transfer {int} points to {actor}', (sender: Actor, points: number, receiver: Actor) => {
    return void 0;
});

Then('the transfer should not be allowed', () => void 0);

Then('the accounts should be as follows:', (table: DataTable) => {
    return void 0;
});
