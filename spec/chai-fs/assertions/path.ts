module.exports = function (chai, utils) {

    let Assertion = chai.Assertion;
    let flag = utils.flag;
    let assert = chai.assert;

    let fs = require('fs');

    // -------------------------------------------------------------------------------------------------------------

    Assertion.addMethod('path', function (msg) {
        let preMsg = '';
        if (msg) {
            flag(this, 'message', msg);
            preMsg = msg + ': ';
        }

        let obj = this._obj;

        new chai.Assertion(obj, preMsg + 'value').is.a('string');

        let pass = fs.existsSync(obj);

        this.assert(
            pass
            , 'expected #{this} to exist'
            , 'expected #{this} not to exist'
        );
    });
    assert.pathExists = function (val, msg) {
        new chai.Assertion(val).to.be.a.path(msg);
    };
    assert.notPathExists = function (val, msg) {
        new chai.Assertion(val).to.not.be.a.path(msg);
    };
};
