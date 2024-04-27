/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');
const redirects = require('./redirects.config');
const pkg = require('./../../package.json');

const remarkOptions = {
    remarkPlugins: [
        [ require('@docusaurus/remark-plugin-npm2yarn'), { sync: true, converters: [ 'yarn' ] } ],
        [ require('docusaurus-remark-plugin-tab-blocks'), {
            sync: true,
            labels: [
                ['json', 'JSON'],
                ['jsx', 'JSX'],
                ['tsx', 'TSX'],
                ['js', 'JavaScript'],
                ['ts', 'TypeScript'],
            ],
        } ]
    ],
}

const commonOptions = {
    editUrl: 'https://github.com/serenity-js/serenity-js/tree/main/documentation/serenity-js.org/',
};

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Serenity/JS',
    tagline: 'Collaborative test automation at scale!',
    customFields: {
        supportedEngines: pkg.engines,
        currentNodeVersion: process.version,
        description:
            `Serenity/JS is an innovative test automation framework designed to help you create
            high-quality, business-focused test scenarios that interact with any interface of your system
            and produce comprehensive test reports that build trust between delivery teams and the business.
            `,
    },
    url: 'https://serenity-js.org',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'throw',
    favicon: 'icons/favicon.ico',
    trailingSlash: true,

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
                    ...commonOptions,
                    ...remarkOptions,
                    showLastUpdateAuthor: false,
                    showLastUpdateTime: false,
                    sidebarPath: require.resolve('./sidebars.js'),
                    routeBasePath: 'handbook',
                },
                blog: {
                    ...commonOptions,
                    ...remarkOptions,
                    showReadingTime: true,
                    postsPerPage: 3,
                },
                pages: {
                    ...remarkOptions,
                },
                theme: {
                    customCss: [
                        require.resolve('./src/css/custom.scss'),
                    ],
                },
            }),
        ]
    ],

    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            image: 'images/serenity-js-social-card.jpg',    // open graph
            colorMode: {
                disableSwitch: false,
                respectPrefersColorScheme: true,
            },
            docs: {
                sidebar: {
                    hideable: true,
                },
            },
            announcementBar: {
                id: 'announcement-bar',
                content: 'Get our book - <a target="_blank" rel="noopener noreferrer" href="https://www.manning.com/books/bdd-in-action-second-edition">"BDD in Action, Second Edition"</a> 📚',
                backgroundColor: '#FFE46E',
                isCloseable: false,
            },
            navbar: {
                // style: 'dark',
                title: 'Serenity/JS',
                hideOnScroll: true,
                style: 'dark',
                logo: {
                    height: 10,
                    alt: 'Serenity/JS',
                    src: 'images/serenity-js-logo-for-dark-backgrounds.svg',
                    className: 'serenity-js-logo',
                },
                items: [
                    { label: 'Handbook', type: 'doc', docId: 'index', position: 'left' },
                    { label: 'API', to: '/api/core', position: 'left' },
                    { to: '/blog', label: 'Blog', position: 'left' },
                    { to: '/community', label: 'Community', position: 'left' },
                    {
                        to: 'https://github.com/sponsors/serenity-js',
                        label: 'Sponsors',
                        position: 'left',
                    },
                    { label: `Changelog`, to: 'changelog',  position: 'left' },
                    {
                        href: 'https://www.youtube.com/@serenity-js',
                        'aria-label': 'Serenity/JS YouTube channel',
                        title: 'Serenity/JS YouTube channel',
                        position: 'right',
                        className: 'navbar-youtube-link',
                    },
                    {
                        href: 'https://github.com/serenity-js',
                        'aria-label': 'Serenity/JS GitHub repositories',
                        title: 'Serenity/JS GitHub repositories',
                        position: 'right',
                        className: 'navbar-github-link',
                    },
                ],
            },
            footer: {
                copyright: `Made with 💛 in London, UK. Copyright © 2016-${ new Date().getFullYear() } <a href="https://janmolak.com">Jan Molak</a>, smartcode ltd.`,
                links: [
                    {
                        title: 'Handbook',
                        items: [
                            { label: 'Why Serenity/JS', to: '/handbook/' },
                            { label: 'Getting started', to: '/handbook/getting-started' },
                            { label: 'About Serenity/JS', to: '/handbook/about' },
                            { label: 'Web testing', to: '/handbook/web-testing' },
                            { label: 'API testing', to: '/handbook/api-testing' },
                            { label: 'Mobile testing', to: '/handbook/mobile-testing' },
                            { label: 'Core Design Patterns', to: '/handbook/design' },
                            { label: 'Reporting', to: '/handbook/reporting' },
                            { label: 'Test runners', to: '/handbook/test-runners' },
                            { label: 'Integration', to: '/handbook/integration' },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            { label: 'Serenity/JS Community', to: '/community' },
                            { label: 'Blog and announcements', to: '/blog' },
                            {
                                label: `Forum and Q'n'A`,
                                href: 'https://github.com/orgs/serenity-js/discussions',
                            },
                            {
                                label: 'Community Chat',
                                href: 'https://matrix.to/#/#serenity-js:gitter.im',
                            },
                            {
                                label: 'Stack Overflow',
                                href: 'https://stackoverflow.com/questions/tagged/serenity-js',
                            },
                            {
                                label: 'LinkedIn',
                                href: 'https://www.linkedin.com/company/serenity-js',
                            },
                            {
                                label: 'YouTube',
                                href: 'https://www.youtube.com/@serenity-js',
                            },
                            {
                                label: 'GitHub Sponsors',
                                href: 'https://github.com/sponsors/serenity-js',
                            },
                        ],
                    },
                    {
                        title: 'Developers',
                        items: [
                            { label: 'API Docs', to: '/api/core' },
                            { label: 'Project Templates', to: 'https://github.com/serenity-js/?q=template&type=all&language=&sort=' },
                            { label: 'Serenity/JS GitHub', href: 'https://github.com/serenity-js', },
                            { label: 'Report an issue', href: 'https://github.com/serenity-js/serenity-js/issues', },
                        ],
                    },
                    {
                        title: 'Legal',
                        items: [
                            {
                                label: 'License',
                                to: '/legal/license',
                            },
                            {
                                label: 'Privacy policy',
                                to: '/legal/privacy-policy',
                            },
                        ],
                    },
                ],
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
                additionalLanguages: [
                    'docker',
                    'gherkin',
                    'properties',
                ],
            },
            mermaid: {
                theme: {
                    light: 'neutral',
                    dark: 'neutral'
                },
            },
            algolia: {
                appId: 'BQR1GG2FWV',
                // Search only (public) API key
                apiKey: 'b4ffe01f2e8ba40f5f49153cab71b9e8',
                indexName: 'serenity-js',
                contextualSearch: true,
            },
        }),

    plugins: [
        'docusaurus-plugin-sass',
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
                        path: 'packages/playwright-test',
                        entry: {
                            index: { label: 'index', path: 'src/index.ts' },
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
                sortPackages: (a, b) => {
                    const packageOrder = [
                        // Core
                        '@serenity-js/core',
                        '@serenity-js/assertions',

                        // Web testing
                        '@serenity-js/web',
                        '@serenity-js/playwright',
                        '@serenity-js/protractor',
                        '@serenity-js/webdriverio',

                        // Api testing
                        '@serenity-js/rest',
                        '@serenity-js/local-server',

                        // Reporting
                        '@serenity-js/console-reporter',
                        '@serenity-js/serenity-bdd',

                        // Test runner adapters
                        '@serenity-js/cucumber',
                        '@serenity-js/jasmine',
                        '@serenity-js/mocha',
                        '@serenity-js/playwright-test',
                    ]

                    return packageOrder.indexOf(a.packageName) - packageOrder.indexOf(b.packageName);
                },
                sortSidebar: (a, d) => {
                    return a.localeCompare(d);
                },
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
                        './typedoc-plugins/ignore-inherited-static-methods.js',
                        'typedoc-plugin-mdn-links',
                    ],
                    sort: [
                        'static-first',
                        'source-order',
                    ],
                    visibilityFilters: {
                        protected: true,
                        private: false,
                    },
                }
            },
        ],
        [
            'content-docs',
            /** @type {import('@docusaurus/plugin-content-docs').Options} */
            ({
                id: 'community',
                path: 'community',
                routeBasePath: '/community',
                sidebarPath: require.resolve('./sidebarCommunity.js'),
                ...commonOptions,
                ...remarkOptions,
            }),
        ],
        [
            require.resolve('./src/plugins/piwik/index.js'),
            {
                id: '8497b9df-f942-4fb6-9f4f-eade34bab231',
                enable: true,
            }
        ],
        [
            require.resolve('./src/plugins/presets/index.js'),
            {
                projectRoot: path.join(__dirname, '../../'),
                include: [
                    'packages/*'
                ],
                caching: {
                    enabled: true,
                    duration: 24 * 60 * 60 * 1000,
                },
                sampling: {
                    enabled: true,
                    rate: 0.1,
                },
            }
        ],
        [
            require.resolve('./src/plugins/changelog/index.js'),
            {
                blogTitle: 'Serenity/JS Changelog \uD83C\uDF81',
                blogDescription: 'Keep yourself up-to-date about new features in every release',
                blogSidebarCount: 'ALL',
                blogSidebarTitle: 'Changelog',
                routeBasePath: '/changelog',
                showReadingTime: false,
                postsPerPage: 10,
                archiveBasePath: undefined,
                blogTagsListComponent: '@theme/BlogTagsListPage',
                blogTagsPostsComponent: '@theme/BlogTagsPostsPage',
                // authorsMapPath: 'authors.json',
                feedOptions: {
                    type: 'all',
                    title: 'Serenity/JS changelog',
                    description:
                        'Keep yourself up-to-date about new features in every release',
                    copyright: `Copyright © 2016-${new Date().getFullYear()} Jan Molak, SmartCode Ltd`,
                    language: 'en',
                },
            },
        ],
        [
            '@docusaurus/plugin-ideal-image',
            {
                quality: 85,
                steps: 4,
                disableInDev: true,
            },
        ],
        [
            '@docusaurus/plugin-client-redirects',
            redirects,
        ],
    ],

    markdown: {
        mermaid: true,
    },
    themes: [
        '@docusaurus/theme-mermaid'
    ],
};

module.exports = config;
