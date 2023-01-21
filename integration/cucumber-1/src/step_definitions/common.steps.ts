import { AssertionError } from '@serenity-js/core';
import * as assert from 'assert';
import { TableDefinition } from 'cucumber';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export = function () {
    this.Given(/^.*step .* passes$/, function () {
        return Promise.resolve();
    });

    this.Given(/^.*step .* fails with a generic error$/, function () {
        return Promise.reject(new Error(`Something's wrong`));
    });

    this.Given(/^.*step .* fails with an assertion error$/, function () {
        return Promise.reject(new AssertionError(`Expected false to equal true`));
    });

    this.Given(/^.*step .* fails with a non-Serenity assertion error$/, function () {
        assert.strictEqual(false, true);
    });

    this.Given(/^.*step .* marked as pending/, function () {
        return Promise.resolve('pending');
    });

    this.Given(/^.*step .* receives a table:$/, function (data: TableDefinition) {
        return Promise.resolve();
    });

    this.Given(/^.*step .* receives a doc string:$/, function (docstring: string) {
        return Promise.resolve();
    });

    this.Given(/^.*step that times out$/, { timeout: 100 }, function () {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, 1000);
        });
    });
};
