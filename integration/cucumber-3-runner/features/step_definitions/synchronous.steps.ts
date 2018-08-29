import { defineSupportCode, TableDefinition } from 'cucumber';

defineSupportCode(({ Given }) => {
    Given(/^.*step (?:.*) passes$/, function() {
        return void 0;
    });

    Given(/^.*step (?:.*) fails$/, function() {
        throw new Error(`Something's wrong`);
    });

    Given(/^.*step (?:.*) marked as pending/, function() {
        return 'pending';
    });

    Given(/^.*step (?:.*) receives a table:$/, function(data: TableDefinition) {
        return void 0;
    });

    Given(/^.*step (?:.*) receives a doc string:$/, function(docstring: string) {
        return void 0;
    });
});
