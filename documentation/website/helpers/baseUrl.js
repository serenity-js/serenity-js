module.exports = function baseUrl(pathToFile) {
    const moduleNameMatcher = /modules\/(.*?)\//;

    if (! moduleNameMatcher.test(pathToFile)) {
        return '/';
    }

    const [ , moduleName ] = pathToFile.match(moduleNameMatcher);

    return `/modules/${ moduleName }/`;
};
