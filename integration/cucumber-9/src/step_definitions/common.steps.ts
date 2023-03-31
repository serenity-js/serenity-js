import { DataTable, Given } from '@cucumber/cucumber';
import { AssertionError } from '@serenity-js/core';
import * as assert from 'assert';

Given(/^.*step .* passes$/, function () {
    return void 0;
});

Given(/^.*step .* fails with a generic error$/, function () {
    throw new Error(`Something's wrong`);
});

Given(/^.*step .* fails with an assertion error$/, function () {
    throw new AssertionError(`Expected false to equal true`);
});

Given(/^.*step .* fails with a non-Serenity assertion error$/, function () {
    assert.strictEqual(false, true);
});

Given(/^.*step .* marked as pending/, function () {
    return 'pending';
});

Given(/^.*step .* receives a table:$/, function (data: DataTable) {
    return void 0;
});

Given(/^.*step .* receives a doc string:$/, function (docstring: string) {
    return void 0;
});

Given(/^.*step that times out$/,  { timeout: 100 }, () =>
    new Promise((resolve, reject) => {
        setTimeout(resolve, 250);
    }));
