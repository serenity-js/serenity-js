const glob = require('glob');

/**
 * Support for multiple source locations that metalsmith will scan
 *
 * @param pattern
 * @returns {Function}
 */
module.exports = function sources(pattern) {

    function load(ms, dir) {
        return new Promise((resolve, reject) => {
            ms.read(ms.path(dir), (err, newFiles) => {
                if (err) {
                    return reject(err);
                }

                resolve({ dir, newFiles });
            });
        });
    }

    return function(files, ms, done) {

        glob(pattern, (err, matchedDirs) => {
            Promise.all(matchedDirs.map(dir => load(ms, dir))).then(listOfDirsWithFiles => {
                listOfDirsWithFiles.forEach(dirWithFiles => {
                    Object.keys(dirWithFiles.newFiles).forEach(key => {
                        files[`${dirWithFiles.dir}/${key}`] = dirWithFiles.newFiles[key];
                    });
                });
            }).then(done, done);
        });
    };
}