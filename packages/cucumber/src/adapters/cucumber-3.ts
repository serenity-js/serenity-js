import { Dependencies } from './Dependencies';

export = function({ notifier, loader, cucumber }: Dependencies) {
    return function() {
        throw new Error(`Cucumber version 3 is not supported yet.`);
    };
};
