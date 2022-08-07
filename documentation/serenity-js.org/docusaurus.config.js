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
            colorMode: {
                respectPrefersColorScheme: true,
            },
            navbar: {
                // style: 'dark',
                // title: 'Serenity/JS',
                hideOnScroll: true,
                logo: {
                    height: 10,
                    alt: 'Serenity/JS',
                    src: 'img/serenity-js-logo-for-light-backgrounds.svg',
                    srcDark: 'img/serenity-js-logo-for-dark-backgrounds.svg',
                    className: 'serenity-js-logo',
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
                copyright: `Made with 💛 in London, UK. Copyright © 2016-${ new Date().getFullYear() } <a href="https://janmolak.com">Jan Molak</a>, smartcode ltd.`,
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
                            index: { label: 'index', path: 'src/index.ts' },
                            adapter: { label: 'Test runner adapter', path: 'src/adapter/index.ts' },
                            events: { label: 'Domain Events', path: 'src/events/index.ts' },
                        },
                    },
                    {
                        path: 'packages/cucumber',
                        entry: {
                            index: { label: 'index', path: 'src/index.ts' },
                            adapter: { label: 'Test runner adapter', path: 'src/adapter/index.ts' },
                        },
                    },
                    {
                        path: 'packages/jasmine',
                        entry: {
                            index: { label: 'index', path: 'src/index.ts' },
                            adapter: { label: 'Test runner adapter', path: 'src/adapter/index.ts' },
                        },
                    },
                    {
                        path: 'packages/mocha',
                        entry: {
                            index: { label: 'index', path: 'src/index.ts' },
                            adapter: { label: 'Test runner adapter', path: 'src/adapter/index.ts' },
                        },
                    },
                    {
                        path: 'packages/protractor',
                        entry: {
                            index: { label: 'index', path: 'src/index.ts' },
                            adapter: { label: 'Test runner adapter', path: 'src/adapter/index.ts' },
                        },
                    },
                    {
                        path: 'packages/webdriverio',
                        entry: {
                            index: { label: 'index', path: 'src/index.ts' },
                            adapter: { label: 'Test runner adapter', path: 'src/adapter/index.ts' },
                        },
                    },
                    ...[
                        'packages/assertions',
                        'packages/console-reporter',
                        'packages/local-server',
                        'packages/playwright',
                        'packages/rest',
                        'packages/serenity-bdd',
                        'packages/web',
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

                    categorizeByGroup: true,
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
