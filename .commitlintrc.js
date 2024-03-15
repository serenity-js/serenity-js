const { scopes } = require('./.cz-allowed-scopes');

module.exports = {
    extends: [
        '@commitlint/config-conventional'
    ],
    rules: {
        'body-max-line-length':     [ 2, 'always', 500  ],
        'footer-max-line-length':   [ 2, 'always', 500  ],
        'type-case':    [ 2, 'always', 'lower-case' ],
        'scope-empty':  [ 2, 'never'                ],
        'scope-case':   [ 2, 'always', 'lower-case' ],
        'scope-enum':   [ 2, 'always', scopes.all() ]        
    },
    helpUrl: 'https://serenity-js.org/community/contributing/commit-message-conventions/'
}
