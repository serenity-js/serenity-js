require('ts-node/register');

exports.config = {

    /* LOCALHOST CONFIG */
    // seleniumServerJar: "node_modules/protractor/selenium/selenium-server-standalone-2.52.0.jar",
    // baseUrl: 'http://localhost:3000/',

    exclude: [],

    allScriptsTimeout: 110000,

    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),
    specs: [ 'features/**/*.feature' ],
    cucumberOpts: {
        require:    [ 'features/**/*.ts' ],
        format:     'pretty',
        compiler:   'ts:ts-node/register'
    },

    plugins: [
        { path: 'node_modules/serenity/lib/adapters/protractor' }
    ],

    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            // args: ['show-fps-counter=false']
        }
    },

    restartBrowserBetweenTests: true,

    onPrepare: function() {
        browser.ignoreSynchronization = false;
    }
};