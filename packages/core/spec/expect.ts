import chai = require('chai');

import sinonChai = require('sinon-chai');
import chaiAsPromised = require('chai-as-promised');
import { TinyType } from 'tiny-types';

chai.use(function(chai, utils) {
    const Assertion = chai.Assertion;

    function tinyTypeEqual(_super) {
        return function assertTinyTypes(another: TinyType) {

            const obj = this._obj;
            if (obj && obj instanceof TinyType) {
                this.assert(
                    obj.equals(another),
                    `expected #{this} to equal #{exp} but got #{act}`,
                    `expected #{this} to not equal #{exp} but got #{act}`,
                    another,
                    obj,
                );

            } else {
                _super.apply(this, arguments);
            }
        };
    }

    Assertion.overwriteMethod('equal', tinyTypeEqual);
    Assertion.overwriteMethod('equals', tinyTypeEqual);
    Assertion.overwriteMethod('eq', tinyTypeEqual);
});

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const expect = chai.expect;
