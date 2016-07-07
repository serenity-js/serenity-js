require('ts-node/register');

const fs = require('./fs');

exports.config = {


    /**
     * Angular 2 configuration
     *
     * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
     * `rootEl`
     *
     */
    // useAllAngular2AppRoots: true,

    /* LOCALHOST CONFIG */
    // seleniumServerJar: "node_modules/protractor/selenium/selenium-server-standalone-2.52.0.jar",
    // baseUrl: 'http://localhost:3000/',

    exclude: [],

    allScriptsTimeout: 110000,

    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),
    specs: [
        fs.root('acceptance/**/*.feature')
    ],
    cucumberOpts: {
        require: [
            fs.root('acceptance/**/*.ts'),
            fs.root('src/serenity/integration/cucumber/cucumber.ts')
        ],
        format: 'pretty',
        compiler: 'ts:ts-node/register'
    },

    plugins: [{
        path: '../src/serenity/integration/protractor/index.ts'
        // integration: ['cucumber']  // todo: some config option to enable cucumber step listener
    }],

    directConnect: true,

    capabilities: {
        browserName: 'chrome',
        // shardTestFiles: true,
        // maxInstances: 2,
        chromeOptions: {
            args: ['show-fps-counter=true']
        }
    },

    restartBrowserBetweenTests: true,

    onPrepare: function() {
        browser.ignoreSynchronization = false;
    }
};