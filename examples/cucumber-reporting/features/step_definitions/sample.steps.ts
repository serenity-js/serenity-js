import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { AssertionError, TestCompromisedError } from '@serenity-js/core';

Given(/^.*step.*passes$/, function () {
    return Promise.resolve();
});

Given(/^.*step.*fails with an assertion error$/, function () {
    return Promise.reject(new AssertionError('expected true to equal false', false, true));
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
