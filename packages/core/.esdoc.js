module.exports = {
    source: 'src',
    // includes: ['^errors'],
    // excludes: ['^.nyc', '^lib', '^node_modules', '^spec'],
    destination: './target/site',
    plugins: [
        {
            'name': 'esdoc-typescript-plugin', 'option': {'enable': true}
        },
        {
            "name": "esdoc-importpath-plugin",
            "option": {
                "replaces": [
                    { "from": "^src/", "to": "lib/" },
                    { "from": "\\.ts$", "to": "" }
                ]
            }
        },
        {
            'name': 'esdoc-standard-plugin',
            'option': {
                'coverage': { 'enable': true },
                'accessor': { 'access': ['public', 'protected'], 'autoPrivate': true },
                'undocumentIdentifier': {'enable': true},
                'test': {
                    'source': './spec/',
                    'interfaces': [ 'describe', 'it' ],
                    'includes': [ 'spec\\.ts$']
                }
            }
        },
    ],
};
