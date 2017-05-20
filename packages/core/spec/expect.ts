import chai = require('chai');

import sinonChai = require('sinon-chai');
import chaiAsPromised = require('chai-as-promised');
import chaiSmoothie = require('chai-smoothie');
import { RecordedActivity, SourceLocation } from '../src/domain/model';

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiSmoothie);

declare global {
    namespace Chai {                // tslint:disable-line:no-namespace
        interface Assertion {
            recorded: Assertion;
            as(name: string): Assertion;
            calledAt(expected_location: { path?: string, line?: number, column?: number }): Assertion;
        }
    }
}

chai.use(function(chai, utils) {
    const Assertion = chai.Assertion;

    Assertion.addProperty('recorded', function() {
        new Assertion(this._obj).to.be.instanceof(RecordedActivity);
    });

    Assertion.addMethod('as', function(expected_name) {
        new Assertion(this._obj.name).to.equal(expected_name);
    });

    Assertion.addMethod('calledAt', function(expected_location: SourceLocation) {

        if (! this._obj.location) {
            throw new TypeError(`${ this._obj } does not have a 'location' property`);
        }

        if (expected_location.path) {
            new Assertion(
                this._obj.location.path,
                `Expected '${this._obj}' to have been called from ${expected_location.path}, not ${this._obj.location.path}`,
            ).contains(expected_location.path);
        }

        if (expected_location.line) {
            new Assertion(
                this._obj.location.line,
                `Expected '${this._obj}' to have been called on line ${expected_location.line}, not ${this._obj.location.line}`,
            ).equal(expected_location.line);
        }

        if (expected_location.column) {
            new Assertion(
                this._obj.location.column,
                `Expected '${this._obj}' to have been called at column ${expected_location.column}, not ${this._obj.location.column}`,
            ).equal(expected_location.column);
        }
    });
});

const expect = chai.expect;

export = expect;
