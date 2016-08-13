module.exports = function (chai, utils) {

    let Assertion = chai.Assertion;
    let flag = utils.flag;
    let assert = chai.assert;

    let fs = require('fs');

    // -------------------------------------------------------------------------------------------------------------

    Assertion.addMethod('file', function (msg) {
        let preMsg = '';
        if (msg) {
            flag(this, 'message', msg);
            preMsg = msg + ': ';
        }

        let obj = this._obj;

        new chai.Assertion(obj, preMsg + 'value').is.a('string');
        new chai.Assertion(obj, preMsg + 'value').to.be.a.path();

        let pass = fs.statSync(obj).isFile();

        flag(this, 'fs.isFile', pass);

        this.assert(
            pass
            , 'expected #{this} to be a file'
            , 'expected #{this} not to be a file'
        );
    });
    assert.isFile = function (val, msg) {
        new chai.Assertion(val).to.be.a.file(msg);
    };
    assert.notIsFile = function (val, msg) {
        new chai.Assertion(val).to.not.be.a.file(msg);
    };

    // -------------------------------------------------------------------------------------------------------------

    Assertion.addOverwritePropertyFlag('empty', 'fs.isFile', function (obj) {

        let pass = fs.statSync(obj).size === 0;
        let test = new Assertion(obj, flag(this, 'message'));

        // TODO verify this if/else makes sense
        if (flag(this, 'negate')) {
            test.assert(
                ! pass
                , 'expected #{this} not to be an empty file'
                , 'expected #{this} to be an empty file'
            );
        }
        else {
            test.assert(
                pass
                , 'expected #{this} to be an empty file'
                , 'expected #{this} not to be an empty file'
            );
        }
    });

    assert.isEmptyFile = function (val, msg) {
        /* jshint -W030 */
        new chai.Assertion(val).to.be.a.file(msg).and.empty;
    };
    assert.notIsEmptyFile = function (val, msg) {
        /* jshint -W030 */
        new chai.Assertion(val).to.be.a.file(msg).and.not.empty;
    };

    // -------------------------------------------------------------------------------------------------------------

    Assertion.addProperty('json', function () {
        let obj = this._obj;

        if (! flag(this, 'fs.isFile')) {
            this.assert(
                false
                , 'expected #{this} to be chained after file()'
            );
        }

        let pass = true;
        let json = false;
        let content = flag(this, 'utf8Content');
        if (! content) {
            content = fs.readFileSync(obj, 'utf8');
            flag(this, 'utf8Content', content);
        }

        try {
            json = JSON.parse(content);
            flag(this, 'isJson', true);
            flag(this, 'jsonContent', json);
        }
        catch (e) {
            pass = false;
        }

        flag(this, 'fs.isJsonFile', pass);

        this.assert(
            pass
            , 'expected #{this} to be an json file'
            , 'expected #{this} not to be an json file'
        );
    });
    /*Assertion.addOverwritePropertyFlag('json', 'fs.isFile', function (obj) {
     console.log('json fs.isFile');
     console.log(obj);

     if (!flag(this, 'fs.isFile')) {
     this.assert(
     false
     , 'expected #{this} to be chained after file()'
     );
     }

     let pass = true;
     let json = false;
     let content = flag(this, 'utf8Content');
     try {
     if (!content) {
     content = fs.readFileSync(obj, 'utf8');
     flag(this, 'utf8Content', content);
     }
     json = JSON.parse(content);
     flag(this, 'isJson', true);
     flag(this, 'jsonContent', json);
     }
     catch (e) {
     pass = false;
     }
     flag(this, 'fs.isJsonFile', pass);

     this.assert(
     pass
     , 'expected #{this} to be an json file'
     , 'expected #{this} not to be an json file'
     );
     });*/

    assert.jsonFile = function (val, msg) {
        /* jshint -W030 */
        new chai.Assertion(val).to.be.a.file(msg).with.json;
    };
    assert.notJsonFile = function (val, msg) {
        /* jshint -W030 */
        new chai.Assertion(val).to.be.a.file(msg).not.with.json;
    };

    // -------------------------------------------------------------------------------------------------------------

    Assertion.addMethod('schema', function (schema) {
        // let obj = this._obj;

        assert.isFunction(assert.jsonSchema, 'expected chai-json-schema dependency (assert.jsonSchema)');
        assert.isFunction(assert.notJsonSchema, 'expected chai-json-schema dependency (assert.notJsonSchema)');

        if (! flag(this, 'isJson')) {
            this.assert(
                false
                , 'expected #{this} to be chained after a isJson'
            );
        }
        if (! flag(this, 'jsonContent')) {
            this.assert(
                false
                , 'expected #{this} to be chained after a jsonContent'
            );
        }

        let json = flag(this, 'jsonContent');

        if (flag(this, 'negate')) {
            assert.notJsonSchema(json, schema, flag(this, 'message'));
        }
        else {
            assert.jsonSchema(json, schema, flag(this, 'message'));
        }
    });

    assert.jsonSchemaFile = function (val, schema, msg) {
        new chai.Assertion(val).to.be.a.file(msg).with.json.schema(schema);
    };
    assert.notJsonSchemaFile = function (val, schema, msg) {
        new chai.Assertion(val).to.be.a.file(msg).with.json.not.schema(schema);
    };
};
