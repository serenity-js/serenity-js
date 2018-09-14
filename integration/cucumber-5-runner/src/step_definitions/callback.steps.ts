import { Given, TableDefinition } from 'cucumber';

type Callback = (error?: Error, pending?: string) => void;

Given(/^.*step (?:.*) passes$/, function(done: Callback) {
    done();
});

Given(/^.*step (?:.*) fails$/, function(done: Callback) {
    done(new Error(`Something's wrong`));
});

Given(/^.*step (?:.*) marked as pending/, function(done: Callback) {
    done(void 0, 'pending');
});

Given(/^.*step (?:.*) receives a table:$/, function(data: TableDefinition, done) {
    done();
});

Given(/^.*step (?:.*) receives a doc string:$/, function(docstring: string, done) {
    done();
});

Given(/^.*step that times out$/,  { timeout: 100 }, function(done: Callback) {
    setTimeout(done, 1000);
});
