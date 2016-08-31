require('ts-node/register');

exports.config = {

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

    plugins: [{
        path: 'node_modules/serenity-bdd/lib/serenity-protractor/adapter'
    }],

    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
             // args: ['show-fps-counter=false']
            args: [ 'incognito', 'disable-extensions']
        }
    },

    restartBrowserBetweenTests: true,

    onPrepare: function() {
        browser.ignoreSynchronization = false;
    }
};
