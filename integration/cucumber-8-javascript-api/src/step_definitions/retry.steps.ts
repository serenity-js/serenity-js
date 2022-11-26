import { Given } from '@cucumber/cucumber';

let retriesNeeded = 2;

Given('a step that eventually passes', function () {
    if (retriesNeeded > 0) {
        --retriesNeeded;

        throw new Error('Try again');
    }
});
