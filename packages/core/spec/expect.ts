/* eslint-disable unicorn/prevent-abbreviations */
import chaiModule = require('chai');

import chaiAsPromised = require('chai-as-promised');
import sinonChai = require('sinon-chai');
import { TinyType } from 'tiny-types';

chaiModule.use(function (chai, utils) {
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
                Reflect.apply(_super, this, arguments);
            }
        };
    }

    Assertion.overwriteMethod('equal', tinyTypeEqual);
    Assertion.overwriteMethod('equals', tinyTypeEqual);
    Assertion.overwriteMethod('eq', tinyTypeEqual);
});

chaiModule.use(sinonChai);
chaiModule.use(chaiAsPromised);

export const expect = chaiModule.expect;
