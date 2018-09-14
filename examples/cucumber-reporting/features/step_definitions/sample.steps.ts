import { Given, TableDefinition, Then, When } from 'cucumber';

Given(/^.*step.*passes$/, function() {
    return Promise.resolve();
});

Given(/^.*step.*fails$/, function() {
    return Promise.reject(new Error(`Something's wrong`));
});

Given(/^.*step.*marked as pending/, function() {
    return Promise.resolve('pending');
});

Given(/^.*step.*receives a table:$/, function(data: TableDefinition) {
    return Promise.resolve();
});

Given(/^.*step.*receives a doc string:$/, function(docstring: string) {
    return Promise.resolve();
});

Given(/^.*step.*times out$/,  { timeout: 100 }, function() {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
    });
});

When(/^(.*) makes a contribution/, function(developerName: string, dataTable: TableDefinition) {
    return Promise.resolve();
});

Then(/^.*help bring serenity to fellow devs$/, function() {
    return Promise.resolve();
});
