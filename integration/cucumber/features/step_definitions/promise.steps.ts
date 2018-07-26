import { TableDefinition } from 'cucumber';

export = function() {
    this.Given(/^.*step (?:.*) passes$/, function() {
        return Promise.resolve();
    });

    this.Given(/^.*step (?:.*) fails$/, function() {
        return Promise.reject(new Error(`Something's wrong`));
    });

    this.Given(/^.*step (?:.*) explicitly pending$/, function() {
        return Promise.resolve('pending');
    });

    this.Given(/^.*step (?:.*) explicitly skipped/, function() {
        return Promise.resolve('skipped');
    });

    this.Given(/^.*step (?:.*) receives a table:$/, function(data: TableDefinition, done) {
        return Promise.resolve();
    });

    this.Given(/^.*step (?:.*) receives a doc string:$/, function(docstring: string, done) {
        return Promise.resolve();
    });

    this.Given(/^.*step times out$/,  { timeout: 100 }, function() {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, 1000);
        });
    });
};
