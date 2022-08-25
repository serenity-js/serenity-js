const { scopes } = require('./.cz-allowed-scopes');

module.exports = {
    extends: [
        '@commitlint/config-conventional'
    ],
    rules: {
        'type-case':    [ 2, 'always', 'lower-case' ],
        'scope-empty':  [ 2, 'never'                ],
        'scope-case':   [ 2, 'always', 'lower-case' ],
        'scope-enum':   [ 2, 'always', scopes.all() ]        
    }
}
