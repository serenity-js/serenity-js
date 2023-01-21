import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, AssertionError, TestCompromisedError } from '@serenity-js/core';
import { strictEqual } from 'assert';

Given(/^.*step.*passes$/, function () {
    return Promise.resolve();
});

Given(/^.*a step.*fails with a Serenity\/JS AssertionError$/, function () {
    throw new AssertionError('expected true to equal false');
});

Given(/^.* async step.*fails with a Serenity\/JS AssertionError$/, async function () {
    throw new AssertionError('expected true to equal false');
});

Given(/^.*step.*fails with a Serenity\/JS Screenplay AssertionError$/, async function () {
    await actorCalled('Alice').attemptsTo(
        Ensure.that(true, equals(false)),
    );
});

Given(/^.*step.*fails with a Node.js AssertionError$/, function () {
    strictEqual(true, false);
});

Given(/^.*step.*fails with a generic error$/, function () {
    return Promise.reject(new Error(`Something's wrong`));
});

Given(/^.*step.*fails with an error compromising the test$/, function () {
    return Promise.reject(new TestCompromisedError(`Something's wrong`));
});

Given(/^.*step.*marked as pending/, function () {
    return Promise.resolve('pending');
});

Given(/^.*step.*receives a table:$/, function (data: DataTable) {
    return Promise.resolve();
});

Given(/^.*step.*receives a doc string:$/, function (docstring: string) {
    return Promise.resolve();
});

Given(/^.*step.*times out$/,  { timeout: 100 }, function () {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
    });
});

When(/^(.*) makes a contribution/, function(developerName: string, dataTable: DataTable) {
    return Promise.resolve();
});

Then(/^.*help bring serenity to fellow devs$/, function() {
    return Promise.resolve();
});
