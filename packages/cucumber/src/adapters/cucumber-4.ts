import { Dependencies } from './Dependencies';

export = function({ notifier, loader, cucumber }: Dependencies) {
    return function() {
        throw new Error(`Cucumber version 4 is not supported yet.`);
    };
};
