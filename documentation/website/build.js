'use strict';

const
    devMode          = process.env.NODE_ENV === 'dev',
    noop             = (config) => null,
    Metalsmith       = require('metalsmith'),
    inplace          = require('metalsmith-in-place'),
    ignore           = require('metalsmith-ignore'),
    layouts          = require('metalsmith-layouts'),
    discoverHelpers  = require('metalsmith-discover-helpers'),
    discoverPartials = require('metalsmith-discover-partials'),
    cleanCSS         = require('metalsmith-clean-css'),
    fileMetadata     = require('metalsmith-filemetadata'),
    uglify           = require('metalsmith-uglify'),
    sass             = require('metalsmith-sass'),
    debug            = require('./plugins/debug'),
    renamePath       = require('./plugins/renamePath'),
    sources          = require('./plugins/sources'),
    pathToFile       = require('./plugins/pathToFile'),
    highlightEsdoc   = require('./plugins/highlighEsdoc'),
    discoverModules  = require('./plugins/discoverModules'),
    browserSync      = devMode ? require('metalsmith-browser-sync') : noop,
    highlight        = require('highlight.js'),

    highlightedLanguages = ['typescript', 'javascript', 'json', 'gherkin'];

Metalsmith(__dirname)
    .source('src')
    .use(sources('./node_modules/@serenity-js/*/target/site'))
    .use(renamePath(/\.\/node_modules\/@serenity-js\/(.*)\/target\/site\//, 'modules/$1/'))
    .destination('target/site')
    // .ignore()
    .clean(true)
    .use(discoverHelpers())
    .use(discoverPartials())
    .use(cleanCSS({
        files: 'css/*.css',
        sourceMap: true,
        cleanCSS: {
            rebase: true
        }
    }))
    .use(discoverModules('./node_modules/@serenity-js/*/package.json'))
    .use(fileMetadata([
        {pattern: 'modules/**/*.html', metadata: { 'layout': 'api-docs.hbs' }},
    ]))
    .use(inplace({
        pattern: [
            '**/*',
        ],
        engineOptions: {
            highlight:  (code, language) => highlight.highlightAuto(code, language ? [language] : highlightedLanguages).value,
        }
    }))
    .use(highlightEsdoc(highlight, highlightedLanguages))
    .use(pathToFile())
    .use(layouts({
        directory: 'layouts',
    }))
    // .use(uglify({
    //     concat: true,
    // }))
    .use(sass({
        outputStyle: 'expanded',
    }))
    .use(debug(false))
    .use(browserSync({
        server: 'target/site',
        files: [
            'src/**/*',
            'node_modules/@serenity-js/(.*)/target/site/**/*',
            'layouts/**/*',
            'partials/**/*'
        ]
    }))
    .build(err => {
        if (err) {
            console.error(err);
        }
    });
