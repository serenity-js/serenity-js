import { Given } from '@cucumber/cucumber';

Given('I have a step that throws an error', function () {
    throw new Error(`We're sorry, something happened`);
});
