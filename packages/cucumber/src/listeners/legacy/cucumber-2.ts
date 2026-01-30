import type { Dependencies } from './Dependencies';

export = function ({ serenity, notifier, resultMapper, loader, cucumber, cache }: Dependencies) {
    const adapter = require('./cucumber-0');

    cucumber.defineSupportCode(support =>
        adapter({ serenity, notifier, resultMapper, loader, cucumber, cache }).call(support)
    );

    return function (): void {
        // no-op
    };
};
