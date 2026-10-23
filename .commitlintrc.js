const { scopes } = require('./.cz-allowed-scopes');
const { skillChangesRelease } = require('./bin/commitlint-skill-changes.cjs');

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
        'scope-enum':   [ 2, 'always', scopes.all() ],
        'skill-changes-release': [ 2, 'always' ],
    },
    plugins: [
        { rules: { 'skill-changes-release': skillChangesRelease() } },
    ],
    helpUrl: 'https://serenity-js.org/community/contributing/commit-message-conventions/'
}
