module.exports = function pathToFile() {
    return function(files, metalsmith, done) {
        setImmediate(done);
        Object.keys(files).forEach(path => {
            files[path].pathToFile = path;
        });
    };
};
