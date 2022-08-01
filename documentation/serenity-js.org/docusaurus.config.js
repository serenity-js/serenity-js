/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Serenity/JS',
    tagline: 'Collaborative test automation at scale!',
    url: 'https://serenity-js.org',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'throw',
    favicon: 'icons/favicon.ico',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'serenity-js', // Usually your GitHub org/user name.
    projectName: 'serenity-js', // Usually your repo name.

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            '@docusaurus/preset-classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        'https://github.com/serenity-js/serenity-js/tree/main/documentation/serenity-js.org/',
                },
                blog: {
                    showReadingTime: true,
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        'https://github.com/serenity-js/serenity-js/tree/main/documentation/serenity-js.org/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                // title: 'Serenity/JS',
                logo: {
                    alt: 'Serenity/JS Logo',
                    src: 'img/serenity-js-logo-for-light-backgrounds.svg',
                    srcDark: 'img/serenity-js-logo-for-dark-backgrounds.svg',
                },
                items: [
                    {
                        type: 'doc',
                        docId: 'intro',
                        position: 'left',
                        label: `Tutorial`,
                    },
                    // { to: '/handbook', label: 'Handbook', position: 'left' },
                    {
                        to: 'api',
                        label: 'API docs',
                        position: 'left',
                    },
                    { to: '/blog', label: 'Blog', position: 'right' },
                    {
                        href: 'https://github.com/serenity-js/serenity-js',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                // style: 'dark',
                links: [
                    {
                        title: 'Docs',
                        items: [
                            {
                                label: 'Tutorial',
                                to: '/docs/intro',
                            },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            {
                                label: 'Stack Overflow',
                                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
                            },
                            {
                                label: 'Discord',
                                href: 'https://discordapp.com/invite/docusaurus',
                            },
                            {
                                label: 'Twitter',
                                href: 'https://twitter.com/docusaurus',
                            },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            {
                                label: 'Blog',
                                to: '/blog',
                            },
                            {
                                label: 'GitHub',
                                href: 'https://github.com/facebook/docusaurus',
                            },
                        ],
                    },
                ],
                copyright: `Made with love in London, UK © 2016-${ new Date().getFullYear() } <a href="https://janmolak.com">Jan Molak</a>, smartcode ltd.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),

    plugins: [
        [
            'docusaurus-plugin-typedoc-api',
            {
                gitRefName: 'main',
                projectRoot: path.join(__dirname, '../../'),
                packages: [
                    {
                        path: 'packages/core',
                        entry: {
                            index: 'src/index.ts',
                            events: { label: 'lib/events', path: 'src/events/index.ts' },
                            model: { label: 'lib/model', path: 'src/model/index.ts' },
                        },
                    },
                    ...[
                        'packages/assertions',
                        'packages/console-reporter',
                        'packages/cucumber',
                        'packages/jasmine',
                        'packages/local-server',
                        'packages/mocha',
                        'packages/playwright',
                        'packages/protractor',
                        'packages/rest',
                        'packages/serenity-bdd',
                        'packages/web',
                        'packages/webdriverio',
                    ].map(pathToPackage => ({
                        path: pathToPackage,
                        entry: {
                            index: 'src/index.ts',
                        },
                    }))
                ],
                // minimal: false,
                readmes: true,
                debug: true,
                tsconfigName: 'tsconfig.website.json',
                removeScopes: ['serenity-js'],
                typedocOptions: {
                    excludeExternals: false,

                    // typedoc-plugin-ignore-inherited-static-methods
                    logIgnoredInheritedStaticMethods: true,

                    plugin: [
                        '../typedoc-plugin-ignore-inherited-static-methods',
                        'typedoc-plugin-mdn-links',
                    ],
                    sort: [
                        'static-first',
                        'source-order',
                    ],
                    visibilityFilters: {
                        protected: true,
                        private: false,
                    }
                }
            },
        ],
    ]
};

module.exports = config;
