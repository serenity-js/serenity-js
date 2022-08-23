const { scopes } = require('./.cz-allowed-scopes');

module.exports = {
    types: [
        { value: 'feat',      name: 'feat:     A new feature that will be available to the developers using Serenity/JS, e.g. a new public API' },
        { value: 'fix',       name: 'fix:      A bug fix, prepared typically to address a specific GitHub ticket' },
        { value: 'docs',      name: 'docs:     Documentation only changes affecting the website, examples, or the API docs' },
        { value: 'style',     name: 'style:    Changes that do not affect the meaning of the code, e.g. formatting, fixing missing semicolons, etc.' },
        { value: 'refactor',  name: 'refactor: Improvements to code that do not affect the observable behaviour of Serenity/JS' },
        { value: 'perf',      name: 'perf:     A code change aimed at improving performance' },
        { value: 'test',      name: 'test:     Improvements to existing internal tests, or adding missing tests' },
        { value: 'revert',    name: 'revert:   Revert to a commit' },
        { value: 'ci',        name: 'ci:       Changes affecting the tools used in our CI/CD pipeline: e.g. build scripts, GitHub Actions, Gitpod, ESLint, etc.' },
        { value: 'chore',     name: `chore:    Other changes that don't modify src or test files, e.g. updates to dependencies` },
    ],

    // scopes:         scopes.all().map(name => ({ name })),
    scopeOverrides: {
        'feat':     [ ...scopes.serenityPackages() ],
        'fix':      [ ...scopes.serenityPackages() ],
        'docs':     [ ...scopes.serenityPackages(), scopes.documentation() ],
        'style':    [ ...scopes.all() ],
        'refactor': [ ...scopes.serenityPackages() ],
        'perf':     [ ...scopes.serenityPackages() ],
        'test':     [ ...scopes.serenityPackages() ],
        'revert':   [ ...scopes.all() ],
        'ci':       [ ...scopes.ci() ],
        'chore':    [ ...scopes.all() ],
    },

    messages: {
      type:     "Select the TYPE of change you're proposing:",
      scope:    '\nDenote the SCOPE of this change:', // so that we know what needs to be released?
      // used if allowCustomScopes is true
      customScope: 'Denote the SCOPE of this change:',
      subject:  'WHAT did you change? Please write a SHORT, IMPERATIVE tense description of the change:\n',
      body:     'WHY did you change it? Provide a LONGER description of the motivation behind the change (optional). Use "|" to break new line\n',
      breaking: 'List any BREAKING CHANGES, e.g. any public APIs (optional):\n',
      footer:   'List any GitHub TICKETS affected by this change (optional). E.g.: #31, #34:\n',
      confirmCommit: 'Are you sure you want to proceed with the commit above?',
    },

    allowCustomScopes: false,
    allowBreakingChanges: ['feat', 'fix'],

    // limit subject length
    subjectLimit: 100,
    footerPrefix : 'Related tickets:'
}
