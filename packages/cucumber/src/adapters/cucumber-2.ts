import { Dependencies } from './Dependencies';

export = function({ notifier, loader, cucumber, cache }: Dependencies) {
    const adapter = require('./cucumber-0'); // tslint:disable-line:no-var-requires

    cucumber.defineSupportCode(support => adapter({ notifier, loader, cucumber, cache }).call(support));

    return function() {
        // no-op
    };
};
