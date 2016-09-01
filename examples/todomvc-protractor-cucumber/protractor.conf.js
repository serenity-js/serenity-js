require('ts-node/register');

exports.config = {

    baseUrl: 'http://todomvc.dev',

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
            args: [
                'incognito',
                'disable-extensions',
                // 'show-fps-counter=true'
            ]
        }
    },

    restartBrowserBetweenTests: true,

    onPrepare: function() {
        browser.ignoreSynchronization = false;
    }
};
