var pkg     = require('./package.json'),
    repoUrl = 'https://github.com/jan-molak/serenity-js';

module.exports = {
    // Documentation for GitBook is stored under "docs"
    root:        './book',
    title:       'Serenity/JS Handbook',
    description: 'A comprehensive reference manual and tutorials for Serenity/JS, a next generation automated testing library',

    author: 'Jan Molak',

    plugins: [
        'anchors',
        'advanced-emoji',
        'editlink',
        'include-codeblock',
        'ga',
        'github',
        'styles-less',
        'youtube'
    ],

    variables: {
        package:     pkg,
        api_version: pkg.version
    },

    styles: {
        website: "./styles/website.less"
    },

    custom: {
    },

    pluginsConfig: {
        editlink: {
            base: repoUrl + '/edit/master/book',
            label: 'Edit on github',
            multilingual: false
        },

        ga: {
            token: 'UA-85788349-2'
        },

        github: {
            url: repoUrl
        },

        "sharing": {
            "twitter": true,
            "google": true,
            "facebook": true,
            "weibo": false,
            "instapaper": false,
            "vk": false,
            "all": [
                "facebook", "google", "twitter",
                "weibo", "instapaper", "vk"
            ]
        }
    }
};