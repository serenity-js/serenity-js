/**
 * @param {RegExp} from
 * @param {string} to
 * @returns {Function}
 */
module.exports = function renamePath(from, to) {
    return function(files, metalsmith, done) {
        Object.keys(files).filter(path => from.test(path)).forEach(path => {
            delete Object.assign(files, {[path.replace(from, to)]: files[path] })[path];
        });

        done();
    };
};
