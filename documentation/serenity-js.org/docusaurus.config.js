/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');
const redirects = require('./redirects.config');
const pkg = require('./../../package.json');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Serenity/JS',
    tagline: 'Collaborative test automation at scale!',
    customFields: {
        supportedEngines: pkg.engines,
        currentNodeVersion: process.version,
        description:
            `Serenity/JS is an open-source acceptance testing framework that brings your business and software delivery teams together.
            It helps you capture your domain language and write high-quality single- and multi-actor test scenarios
            that interact with any interface of your system.
            Your Serenity/JS-based test code is also portable and reusable, so you can share it with other teams to benefit your entire organisation.
            `
    },
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
                    routeBasePath: 'handbook',
                    remarkPlugins: [ ],
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
                    { label: 'API', to: '/api', position: 'left' },
                    { to: '/blog', label: 'Blog', position: 'left' },
                    { to: '/contributing', label: 'Contribute', position: 'left' },
                    { label: `Changelog \uD83C\uDF81`, to: 'changelog',  position: 'left' },
                    {
                        to: 'https://matrix.to/#/#serenity-js:gitter.im',
                        label: 'Chat',
                        position: 'right',
                    },
                    {
                        to: 'https://github.com/serenity-js/serenity-js',
                        label: 'GitHub',
                        position: 'right',
                    },
                    {
                        to: 'https://www.youtube.com/@serenity-js',
                        label: 'YouTube',
                        position: 'right',
                    },
                    {
                        to: 'https://github.com/sponsors/serenity-js',
                        label: 'Sponsors 💛',
                        position: 'right',
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
                            { label: 'Blog and announcements', to: '/blog' },
                            {
                                label: 'Serenity/JS Community Chat',
                                href: 'https://matrix.to/#/#serenity-js:gitter.im',
                            },
                            {
                                label: 'Stack Overflow',
                                href: 'https://stackoverflow.com/questions/tagged/serenity-js',
                            },
                            {
                                label: 'Serenity/JS on LinkedIn',
                                href: 'https://www.linkedin.com/company/serenity-js',
                            },
                            {
                                label: 'Serenity/JS GitHub Sponsors',
                                href: 'https://github.com/sponsors/serenity-js',
                            },
                        ],
                    },
                    {
                        title: 'Developers',
                        items: [
                            { label: 'API Docs', to: '/api' },
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
                                to: '/license',
                            },
                            {
                                label: 'Privacy policy',
                                to: '/privacy-policy',
                            },
                        ],
                    },
                ],
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
                additionalLanguages: [
                    'gherkin'
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
                    // todo: remove when merged https://github.com/milesj/docusaurus-plugin-typedoc-api/pull/67
                    inlineTags: [ '@link', '@inheritDoc', '@label', '@linkcode', '@linkplain', '@apilink', '@doclink' ],
                }
            },
        ],
        [
            require.resolve('./src/plugins/piwik/index.js'),
            {
                id: '8497b9df-f942-4fb6-9f4f-eade34bab231',
                enable: true,
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
                postsPerPage: 1,
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
