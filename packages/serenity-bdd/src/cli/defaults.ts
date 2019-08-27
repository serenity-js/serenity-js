/**
 * @desc
 *  Default configuration to be used when invoking the serenity-bdd command line interface.
 *  See the source code to find out more about the values being used.
 *
 * @typedef {Object} defaults
 * @property {string} artifact      The GAV identifier of the artifact to download from the artifact repository
 * @property {string} repository    The URL of the repository where the artifact can be found
 * @property {string} cacheDir      A relative path to the directory where the artifact should be downloaded
 * @property {string} sourceDir     A relative path to the directory where the intermediate Serenity/JS JSON reports have been generated
 * @property {string} reportDir     A relative path to the directory where the Serenity BDD HTML report should be generated
 * @property {string} featuresDir   A relative path to the Cucumber.js features directory (if Cucumber is used)
 *
 * @public
 */
export const defaults = {
    artifact:    'net.serenity-bdd:serenity-cli:jar:all:2.1.9',
    repository:  'http://jcenter.bintray.com/',
    cacheDir:    'cache',
    sourceDir:   'target/site/serenity',
    reportDir:   'target/site/serenity',
    featuresDir: 'features',
};
