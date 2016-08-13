module.exports = function (chai, utils) {

    let Assertion = chai.Assertion;
    let flag = utils.flag;

    // -------------------------------------------------------------------------------------------------------------

    Assertion.addProperty('using', function () {
        flag(this, 'chain-using', true);
    });
    Assertion.addProperty('with', function () {
        flag(this, 'chain-with', true);
    });

    /*Assertion.addProperty('but', function () {
     flag(this, 'chain-but', true);
     });
     Assertion.addProperty('without', function () {
     flag(this, 'chain-without', true);
     flag(this, 'negate', true);
     });*/

    Assertion.overwriteProperty('empty', function (_super) {
        return function () {
            let obj = this._obj;

            if (! Assertion.handleOverwritePropertyFlag.call(this, 'empty', obj)) {
                // unhandled
                _super.call(this);
            }
        };
    });
};
