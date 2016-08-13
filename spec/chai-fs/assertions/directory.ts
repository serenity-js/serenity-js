module.exports = function (chai, utils) {

    let Assertion = chai.Assertion;
    let flag = utils.flag;
    let assert = chai.assert;

    let fs = require('fs');

    // -------------------------------------------------------------------------------------------------------------

    Assertion.addMethod('directory', function (msg) {
        let preMsg = '';
        if (msg) {
            flag(this, 'message', msg);
            preMsg = msg + ': ';
        }

        let obj = this._obj;

        new chai.Assertion(obj, preMsg + 'value').is.a('string');
        new chai.Assertion(obj, preMsg + 'value').to.be.a.path();

        let pass = fs.statSync(obj).isDirectory();

        flag(this, 'fs.isDirectory', pass);

        this.assert(
            pass
            , 'expected #{this} to be a directory'
            , 'expected #{this} not to be a directory'
        );
    });
    assert.isDirectory = function (val, msg) {
        new chai.Assertion(val).to.be.a.directory(msg);
    };
    assert.notIsDirectory = function (val, msg) {
        new chai.Assertion(val).to.not.be.a.directory(msg);
    };

    // -------------------------------------------------------------------------------------------------------------

    Assertion.addOverwritePropertyFlag('empty', 'fs.isDirectory', function (obj) {

        let pass = fs.readdirSync(obj).length === 0;
        let test = new Assertion(obj, flag(this, 'message'));

        // TODO verify this if/else makes sense
        if (flag(this, 'negate')) {
            test.assert(
                ! pass
                , 'expected #{this} not to be an empty directory'
                , 'expected #{this} to be an empty directory'
            );
        }
        else {
            test.assert(
                pass
                , 'expected #{this} to be an empty directory'
                , 'expected #{this} not to be an empty directory'
            );
        }
    });

    assert.isEmptyDirectory = function (val, msg) {
        /* jshint -W030 */
        new chai.Assertion(val).to.be.a.directory(msg).and.empty;
    };
    assert.notIsEmptyDirectory = function (val, msg) {
        /* jshint -W030 */
        new chai.Assertion(val).to.be.a.directory(msg).and.not.empty;
    };
};
