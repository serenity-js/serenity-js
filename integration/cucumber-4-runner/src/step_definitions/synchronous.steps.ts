import { AssertionError } from '@serenity-js/core';
import { Given, TableDefinition } from 'cucumber';

Given(/^.*step (?:.*) passes$/, function () {
    return void 0;
});

Given(/^.*step (?:.*) fails with generic error$/, function () {
    throw new Error(`Something's wrong`);
});

Given(/^.*step (?:.*) fails with assertion error$/, function () {
    throw new AssertionError(`Expected false to equal true`, false, true);
});

Given(/^.*step (?:.*) marked as pending/, function () {
    return 'pending';
});

Given(/^.*step (?:.*) receives a table:$/, function (data: TableDefinition) {
    return void 0;
});

Given(/^.*step (?:.*) receives a doc string:$/, function (docstring: string) {
    return void 0;
});
