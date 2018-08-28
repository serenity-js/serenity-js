import { Dependencies } from './Dependencies';

export = function({ notifier, loader, cucumber }: Dependencies) {
    const adapter = require('./cucumber-0'); // tslint:disable-line:no-var-requires

    cucumber.defineSupportCode(support => adapter({ notifier, loader, cucumber }).call(support));

    return function() {
        // no-op
    };
};
