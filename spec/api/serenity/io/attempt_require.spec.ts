import expect = require('../../../expect');
import { attemptToRequire } from '../../../../src/serenity/io';

describe ('io', () => {

    describe ('attemptRequire', () => {

        it ('loads a module if it has been installed', () => {

            const Mocha = attemptToRequire('mocha');

            expect(Mocha).to.not.be.null;
            expect(Mocha).to.be.instanceof(Function);
        });

        it ('loads a module if it has been installed', () => {

            expect(() => attemptToRequire('non-existent')).
                to.throw('This feature requires the \'non-existent\' module, which seems to be missing. ' +
                'To install it, run: `npm install non-existent --save[-dev]`');
        });
    });

});
