const { NoOpDiffFormatter } = require('@serenity-js/core');

const port = process.env.PORT || 8080;

const specs = [
    './node_modules/@integration/web-specs/spec/**/*.spec.ts',
    './spec/**/*.spec.ts',
];

exports.config = {

    baseUrl: `http://localhost:${port}`,

    SELENIUM_PROMISE_MANAGER: false,

    onPrepare: function () {
        return require('protractor').browser.waitForAngularEnabled(false);
    },

    allScriptsTimeout: 120_000,

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'mocha',
        diffFormatter: new NoOpDiffFormatter(),
        crew: [
            // [ '@serenity-js/console-reporter', { theme: 'dark' } ],
            [ '@integration/testing-tools:TestRunnerTagger', 'protractor' ],
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: `${ process.cwd() }/target/site/serenity` } ],
            [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ],
            [ '@serenity-js/serenity-bdd', { specDirectory: '.' } ],
        ]
        .concat(process.env.CI && [ [ '@serenity-js/console-reporter', { theme: 'dark' } ] ])
        .filter(Boolean)
    },

    specs,

    mochaOpts: {
        timeout: 60_000,
        // ts-node is already loaded by nyc when protractor is executed via npm test
        require: [
            'ts-node/register',
        ],
        reporter: 'spec',
    },

    chromeDriver: require(`chromedriver`).path,
    directConnect: true,

    capabilities: {
        browserName: 'chrome',
        acceptInsecureCerts: true,

        loggingPrefs: {
            browser: 'INFO',
        },

        'goog:chromeOptions': {
            // As of version 75, ChromeDriver is W3C by default, which Protractor does not fully support.
            w3c: false,
            excludeSwitches: [ 'enable-automation' ],
            args: [
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--allow-file-access',
                '--headless',
                '--disable-gpu',
                '--window-size=1024x768',
            ],
        },
    },
};
