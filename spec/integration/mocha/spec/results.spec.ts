import expect = require('../../../expect');

describe ('Integration with Mocha', () => {

    describe ('A sample test that', () => {

        it ('passes', () => {
            expect('pass').to.equal('pass');
        });

        it ('fails', () => {
            expect('pass').to.equal('fail');
        });

        it ('is pending');

        xit ('is skipped', () => {
            expect('pass').to.equal('fail');
        });
    });

});
