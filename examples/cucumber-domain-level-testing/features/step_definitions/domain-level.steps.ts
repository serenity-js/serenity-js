import { Then, When } from 'cucumber';

When(/(.*?) enters (\d+)/, function(actorName: any, operandValue: string) {
    return 'pending';
});

When(/(?:he|she|they) uses? the (.*) operator/, function(operatorName: string) {
    return 'pending';
});

Then(/(?:he|she|they) should get a result of (\d+)/, function(expectedResult: string) {
    return 'pending';
});
