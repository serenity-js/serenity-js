import { After, AfterStep, Before, BeforeStep, Given, Then } from '@cucumber/cucumber';

Before({ name: 'Before scenario hook' }, function () {
    return void 0;
});

BeforeStep(function () {
    return void 0;
});

AfterStep(function () {
    return void 0;
});

After({ name: 'After scenario hook' }, function () {
    return void 0;
});

Given('I have a tasty cucumber in my belly', function () {
    return void 0;
});

Then(`I'm very happy`, function () {
    return void 0;
});
