import { TinyType } from 'tiny-types';

export function equals(chai: any, utils: any) {
    const Assertion = chai.Assertion;

    function tinyTypeEquals(_super) {
        return function assertTinyTypes(another: TinyType) {

            const object = this._obj;
            return object && object instanceof TinyType ? this.assert(
                object.equals(another),
                `expected #{this} to equal #{exp} but got #{act}`,
                `expected #{this} to not equal #{exp} but got #{act}`,
                another.toString(),
                object.toString(),
            ) : Reflect.apply(_super, this, arguments);
        };
    }

    Assertion.overwriteMethod('equal',  tinyTypeEquals);
    Assertion.overwriteMethod('equals', tinyTypeEquals);
    Assertion.overwriteMethod('eq',     tinyTypeEquals);
}
