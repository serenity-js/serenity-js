import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { TinyType } from 'tiny-types';

function tinyTypeEquals(_super) {
    return function assertTinyTypes(another: TinyType) {

        const obj = this._obj;  // eslint-disable-line unicorn/prevent-abbreviations
        if (obj && obj instanceof TinyType) {
            return this.assert(
                obj.equals(another),
                `expected #{this} to equal #{exp} but got #{act}`,
                `expected #{this} to not equal #{exp} but got #{act}`,
                another.toString(),
                obj.toString(),
            );
        }

        return _super.apply(this, arguments);   // eslint-disable-line prefer-rest-params,unicorn/prefer-reflect-apply
    };
}

export function assertionsForTinyTypes(ch, utils) {
    const Assertion = ch.Assertion;

    Assertion.overwriteMethod('equal',  tinyTypeEquals);
    Assertion.overwriteMethod('equals', tinyTypeEquals);
    Assertion.overwriteMethod('eq',     tinyTypeEquals);
}

export const expect = chai
    .use(chaiAsPromised)
    .use(assertionsForTinyTypes)
    .use(sinonChai)
    .expect;
