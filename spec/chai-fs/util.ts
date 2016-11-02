module.exports = function (chai, utils) {
    /* jshint -W030 */
    let Assertion = chai.Assertion;
    let flag = utils.flag;

    // -------------------------------------------------------------------------------------------------------------

    //  easy-overwrite chained prop depedning on earlier check
    //  example; expect(v).to.be.a.directory().and.not.empty

    Assertion._overwritePropFlags = {};

    Assertion.addOverwritePropertyFlag = function addOverwritePropertyFlag(prop, currentFlag, func) {
        if (! Assertion._overwritePropFlags.hasOwnProperty(prop)) {
            Assertion._overwritePropFlags[ prop ] = [];
        }
        Assertion._overwritePropFlags[ prop ].push({ prop, flag: currentFlag, func });
    };

    // TODO weird static/instance hybrid.. refactor too get rid of this
    Assertion.handleOverwritePropertyFlag = function handleOverwritePropertyFlag(prop, obj) {
        if (Assertion._overwritePropFlags.hasOwnProperty(prop)) {
            let arr = Assertion._overwritePropFlags[ prop ];
            for (let i = 0, ii = arr.length; i < ii; i ++) {
                let data = arr[ i ];

                if (flag(this, data.flag) === true) {
                    data.func.call(this, obj);
                    return true;
                }
            }
        }
        return false;
    };

    // -------------------------------------------------------------------------------------------------------------

};
