'use strict';

const replace = require('metalsmith-regex-replace/src/replace');

module.exports = function plugin(pattern, config) {

    return (files, metalsmith, done) => {

        Object.keys(files).filter(path => pattern.test(path)).map(path => {
            files[path].contents = Buffer.from(replace(files[path].contents.toString(), config));
        });

        done();
    }
};

