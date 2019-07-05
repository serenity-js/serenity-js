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

    function moduleFor(pathToFile, discoveredModules) {
        const moduleNameMatcher = /modules\/(.*?)\//;

        if (! moduleNameMatcher.test(pathToFile)) {
            // the file does not belong to any module (css files fall into this category)
            return undefined;
        }

        const [ , moduleName ] = pathToFile.match(moduleNameMatcher);

        return discoveredModules.find(module => module.shortName === moduleName);
    }

    return function(files, ms, done) {

        // build global metadata of all discovered modules
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

                    return descriptor;
                }))
                .then(moduleDescriptors => {
                    // make every file "aware" of what module they belong to
                    for (const f in files) {
                        files[f].module = moduleFor(f, moduleDescriptors);
                    }
                })
                .then(() => done(), e => done(e));
        });
    };
};
