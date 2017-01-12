var pkg = require('./package.json');

module.exports = {
    // Documentation for GitBook is stored under "docs"
    root:        './book',
    title:       'Serenity/JS Handbook',
    description: 'A comprehensive reference manual and tutorials for Serenity/JS, a next generation automated testing library',

    author: 'Jan Molak',

    plugins: [
        'anchors',
        'advanced-emoji',
        'include-codeblock',
        'ga',
        'styles-less',
        'youtube'
    ],

    variables: {
        api_version: pkg.version
    },

    styles: {
        website: "./styles/website.less"
    },

    custom: {
        scripts: ["https://buttons.github.io/buttons.js"]
    },

    pluginsConfig: {
        ga: {
            token: 'UA-85788349-2'
        }
    }
};