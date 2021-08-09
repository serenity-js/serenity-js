'use strict';

// copy webfonts

const
    { readFileSync } = require('fs'),
    { resolve }      = require('path'),
    devMode          = process.env.NODE_ENV === 'dev',
    noop             = (config) => null,
    Metalsmith       = require('metalsmith'),
    autotoc          = require('metalsmith-autotoc'),
    inplace          = require('metalsmith-in-place'),
    ignore           = require('metalsmith-ignore'),
    layouts          = require('metalsmith-layouts'),
    discoverHelpers  = require('metalsmith-discover-helpers'),
    discoverPartials = require('metalsmith-discover-partials'),
    fileMetadata     = require('metalsmith-filemetadata'),
    uglify           = require('metalsmith-uglify'),
    path             = require('metalsmith-path'),
    rename           = require('metalsmith-rename'),
    sitemap          = require('metalsmith-sitemap'),
    cleanCSS         = require('./plugins/clean-css'),
    sass             = require('./plugins/sass'),
    debug            = require('./plugins/debug'),
    renamePath       = require('./plugins/renamePath'),
    replace          = require('./plugins/replace'),
    sources          = require('./plugins/sources'),
    source           = require('./plugins/source'),
    pathToFile       = require('./plugins/pathToFile'),
    Prism            = require('./prism'),
    highlightPrism   = require('./plugins/highlightPrism'),
    discoverModules  = require('./plugins/discoverModules'),
    bindHandbook     = require('./plugins/bindHandbook'),
    browserSync      = require('metalsmith-browser-sync'),
    pkg              = require('../../package'),
    lerna            = require('../../lerna');

Metalsmith(__dirname)
    .source('src')
    .use(sources('./node_modules/@serenity-js/*/target/site'))
    .use(renamePath(/\.\/node_modules\/@serenity-js\/(.*)\/target\/site\//, 'modules/$1/'))
    .use(source('../../CHANGELOG.md'))
    .use(renamePath(/\.\.\/\.\.\/(.*)/, '$1'))
    .use(sources('../../node_modules/@fortawesome/fontawesome-free/webfonts'))
    .use(renamePath(new RegExp('../../node_modules/@fortawesome/fontawesome-free/webfonts'), 'webfonts'))
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
    .use(replace(/\.md$/, {
        options: {
            matchCase: false,
            caseSensitive: true,
            isolatedWord: false,
        },
        subs: [
            {
                search: '%package.engines.node%',
                replace: pkg.engines.node,
            },
            {
                search: '%package.engines.npm%',
                replace: pkg.engines.npm,
            },
            {
                search: '%process.version%',
                replace: process.version,
            },
            {
                search: '%lerna.version%',
                replace: lerna.version,
            }
        ]
    }))
    .use(bindHandbook('./src/handbook-toc.yml'))
    .use(fileMetadata([
        {pattern: 'CHANGELOG.md', metadata: { 'layout': 'changelog.hbs', 'autotoc': true }},
        {pattern: 'modules/**/*.hbs', metadata: { 'layout': 'api-docs.hbs' }},
        {pattern: 'modules/index.hbs', metadata: { 'layout': 'default.hbs' }},
    ]))
    .use(path({
        extensions: [ '.md' ],
        baseDirectory: 'documentation/website/src/',
    }))
    .use(rename([
        // any ALL-CAPS markdown files
        [ /([A-Z]+).md/, filename => filename.toLowerCase() ]
    ]))
    .use(inplace({
        rename: true,
        pattern: [
            '**/*',
        ],
        engineOptions: {
            // highlights markdown files
            // langPrefix: 'language-',
            // highlight:  (code, language) => {
            //     return Prism.highlight(
            //         code,
            //         language && Prism.languages[language]
            //             ? Prism.languages[language]
            //             : Prism.languages.plain)
            // },
        }
    }))
    .use(autotoc({selector: 'h2'}))
    // todo: Do I need this?
    .use(highlightPrism(Prism))
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
    .use(sitemap({
        hostname: 'https://serenity-js.org',
        lastmod: new Date(),
        changefreq: 'weekly',
        priority: 0.5,
    }))
    // .use(debug(true))
    .use(devMode ? browserSync({
        server: {
            baseDir: './target/site',
            index: 'index.html'
        },
        files: [
            'src/**/*',
            'node_modules/@serenity-js/(.*)/target/site/**/*',
            'layouts/**/*',
            'partials/**/*'
        ],
        callbacks: {
            ready: function(err, bs) {
                const baseDir = bs.options.get('server').get('baseDir').get(0);

                bs.addMiddleware("*", function (req, res) {
                    res.writeHead(302);
                    res.write(readFileSync(resolve(__dirname, baseDir, '404.html')));
                    res.end();
                });
            }
        }
    }) : noop)
    .build(err => {
        if (err) {
            console.error(err);
        }
    });
