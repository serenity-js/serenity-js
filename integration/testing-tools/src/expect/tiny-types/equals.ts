import { TinyType } from 'tiny-types';

export function equals(chai: any, utils: any) {
    const Assertion = chai.Assertion;

    function tinyTypeEquals(_super) {
        return function assertTinyTypes(another: TinyType) {

            const obj = this._obj;
            if (obj && obj instanceof TinyType) {
                return this.assert(
                    obj.equals(another),
                    `expected #{this} to equal #{exp} but got #{act}`,
                    `expected #{this} to not equal #{exp} but got #{act}`,
                    another.toString(),
                    obj.toString(),
                );

            } else {
                return _super.apply(this, arguments);
            }
        };
    }

    Assertion.overwriteMethod('equal',  tinyTypeEquals);
    Assertion.overwriteMethod('equals', tinyTypeEquals);
    Assertion.overwriteMethod('eq',     tinyTypeEquals);
}
