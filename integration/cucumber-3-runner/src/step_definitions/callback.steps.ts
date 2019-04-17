import { AssertionError } from '@serenity-js/core';
import { defineSupportCode, TableDefinition } from 'cucumber';

type Callback = (error?: Error, pending?: string) => void;

defineSupportCode(({ Given }) => {

    Given(/^.*step (?:.*) passes$/, function (done: Callback) {
        done();
    });

    Given(/^.*step (?:.*) fails with generic error$/, function (done: Callback) {
        done(new Error(`Something's wrong`));
    });

    Given(/^.*step (?:.*) fails with assertion error$/, function (done: Callback) {
        done(new AssertionError(`Expected false to equal true`, false, true));
    });

    Given(/^.*step (?:.*) marked as pending/, function (done: Callback) {
        done(void 0, 'pending');
    });

    Given(/^.*step (?:.*) receives a table:$/, function (data: TableDefinition, done) {
        done();
    });

    Given(/^.*step (?:.*) receives a doc string:$/, function (docstring: string, done) {
        done();
    });

    Given(/^.*step that times out$/, { timeout: 100 }, function (done: Callback) {
        setTimeout(done, 1000);
    });
});
