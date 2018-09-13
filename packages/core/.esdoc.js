module.exports = {
    source: 'src',
    // includes: ['^errors'],
    // excludes: ['^.nyc', '^lib', '^node_modules', '^spec'],
    destination: './target/site',
    plugins: [
        { name: 'esdoc-lint-plugin', option: {enable: true} },
        { name: 'esdoc-coverage-plugin', option: {enable: true} },
        { name: 'esdoc-typescript-plugin', option: {enable: true} },
        { name: 'esdoc-accessor-plugin', option: {enable: true, 'access': ['public', 'protected'], 'autoPrivate': true } },
        { name: 'esdoc-external-ecmascript-plugin', option: {enable: false} },
        { name: 'esdoc-undocumented-identifier-plugin', option: {enable: true} },
        { name: 'esdoc-unexported-identifier-plugin', option: {enable: false} },
        { name: 'esdoc-publish-html-plugin', option: {
            enable: true,
            template: 'node_modules/@documentation/esdoc-template/src'
        }},
        { name: 'esdoc-type-inference-plugin', option: {enable: true} },
        // { name: 'esdoc-integrate-manual-plugin', option: {
        //     enable: true,
        // }},
        { name: 'esdoc-integrate-test-plugin', option: {
            enable: true,
            source: './spec/',
            interfaces: ['describe', 'it'],
            includes: ['spec\\.ts$']
        }},
        { name: 'esdoc-importpath-plugin', option: {
            enable: true,
            replaces: [
                { from: '^src/', to: 'lib/' },
                { from: '\\.ts$', to: '' }
            ]
        }},
    ],
};
