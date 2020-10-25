require('./.esdoc-patches');
const path = require('path');

module.exports = {
    source: 'src',
    includes: ['\\.ts$', '\\.js$'],
    excludes: ['.*serenity-bdd-reporter/processors.*'],
    destination: './target/site',
    plugins: [
        { name: 'esdoc-lint-plugin', option: {enable: true} },
        { name: 'esdoc-coverage-plugin', option: {enable: true} },
        { name: path.resolve(__dirname, './documentation/esdoc-typescript-plugin'), option: {
            enable: true,
        } },
        { name: path.resolve(__dirname, './documentation/esdoc-external-docs-plugin'), option: {
            externals: 'node_modules/@serenity-js/*/target/site/exported.js',
            enable: true,
        } },
        { name: 'esdoc-accessor-plugin', option: {
            enable: true,
            access: ['public', 'protected'],
        } },
        { name: 'esdoc-external-ecmascript-plugin', option: {enable: false} },
        { name: 'esdoc-undocumented-identifier-plugin', option: {enable: true} },
        { name: 'esdoc-unexported-identifier-plugin', option: {enable: false} },
        { name: 'esdoc-publish-html-plugin', option: {
            enable: true,
            template: 'node_modules/@documentation/esdoc-template/src'
        }},
        { name: 'esdoc-type-inference-plugin', option: {enable: true} },
        { name: 'esdoc-integrate-test-plugin', option: {
            enable: true,
            source: './spec/',
            interfaces: ['describe', 'it'],
            includes: ['spec\\.ts$']
        }},
    ],
};
