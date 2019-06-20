const path = require('path');

/**
 * Adds a single source file to the list of processed files
 *
 * @param pathToFile
 * @returns {Function}
 */
module.exports = function source(pathToFile) {

    return function(files, ms, done) {

        const
            absolutePath = ms.path(pathToFile),
            relativePath = path.relative(process.cwd(), absolutePath);

        ms.readFile(absolutePath, (err, file) => {
            if (!! err) {
                return done(err);
            }

            files[`${ relativePath }`] = file;

            done();
        });
    };
}
