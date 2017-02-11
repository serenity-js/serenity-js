import expect = require('../../../expect');

describe ('Integration with Mocha', () => {

    describe ('A sample test that', () => {

        it ('passes', () => {
            expect('pass').to.equal('pass');
        });

        it ('fails due to an AssertionError', () => {
            expect('pass').to.equal('fail');
        });

        it ('fails due to an async AssertionError', () => {
            return expect(Promise.resolve('async pass')).to.eventually.equal('async fail');
        });

        it ('is pending');

        xit ('is skipped', () => {
            expect('pass').to.equal('fail');
        });

        it ('times out', function(done) {
            this.timeout(5);

            setTimeout(done, 100);
        });

        it ('fails with an error', () => {
            throw new Error('Expected problem');
        });

        it ('asynchronously fails with an error', () => Promise.reject(new Error('Expected async problem')));
    });

    describe ('A test with both setup and teardown that', () => {

        beforeEach(() => {
            // setup
        });

        it ('passes', () => {
            expect('pass').to.equal('pass');
        });

        afterEach(() => {
            // teardown
        });
    });

});
