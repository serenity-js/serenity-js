const glob = require('glob');

module.exports = function discoverSerenityJSModules(pattern) {

    function readPackageJSON(ms, pathToFile) {
        return new Promise((resolve, reject) => {
            ms.readFile(ms.path(pathToFile), (err, file) => {
                if (err) {
                    return reject(err);
                }

                try {
                    return resolve(JSON.parse(file.contents.toString('utf8')));
                }
                catch(e) {
                    return reject(e);
                }
            });
        });
    }

    return function(files, ms, done) {

        glob(pattern, (err, matchedPackageJsonFiles) => {
            if (!! err) {
                return done(err);
            }

            Promise.all(matchedPackageJsonFiles.map(pathToPkg => readPackageJSON(ms, pathToPkg)))
                .then(pkgs => pkgs.map(pkg => {
                    const metadata = ms.metadata();
                    metadata.modules = metadata.modules || [];

                    const name = pkg.name.split('/')[1];

                    const descriptor = {
                        href: `/modules/${ name }`,
                        shortName: name,
                        name: pkg.name,
                        description: pkg.description,
                    };

                    if (! metadata.modules.find(m => m.name === descriptor.name)) {
                        metadata.modules.push(descriptor);
                    }
                })).then(() => done(), e => done(e));
        });
    };
};
