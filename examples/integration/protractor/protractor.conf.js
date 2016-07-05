require('ts-node/register');

const
    path  = require('path'),
    _root = path.resolve(__dirname, '../../..');

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [_root].concat(args));
}

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
        root('acceptance/**/*.feature')
    ],
    cucumberOpts: {
        require: [
            root('acceptance/**/*.ts'),
        ],
        format: 'pretty',
        compiler: 'ts:ts-node/register'
    },

    plugins: [{
        path: '../../../src/serenity/integration/protractor/index.ts'
    }],

    // capabilities: {
    //     browserName: 'phantomjs',
    //     'phantomjs.binary.path': require('phantomjs').path,
    // },

    capabilities: {
        browserName: 'chrome',
        // shardTestFiles: true,
        // maxInstances: 2,
        chromeOptions: {
            // args: ['show-fps-counter=true']
        }
    },

    restartBrowserBetweenTests: true,

    onPrepare: function() {
        browser.ignoreSynchronization = false;
    }
};