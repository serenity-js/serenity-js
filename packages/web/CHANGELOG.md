# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0-rc.0](https://github.com/serenity-js/serenity-js/compare/v2.32.5...v3.0.0-rc.0) (2021-12-08)


### Bug Fixes

* **core:** 3.0 RC ([469d54e](https://github.com/serenity-js/serenity-js/commit/469d54e4f81ef430566b93852e3174826f8ef672)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **core:** renamed "Model" type to "Adapter" to better reflect its purpose ([b4ea7a1](https://github.com/serenity-js/serenity-js/commit/b4ea7a100fac2c896990bf15cbc906de641196b8)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** added missing export ([c5ffc0a](https://github.com/serenity-js/serenity-js/commit/c5ffc0a83905c99ea0020577503170c427fdb9f2)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **webdriverio:** separated UIElement.hoverOver from UIElement.scrollIntoView ([cf4ca2c](https://github.com/serenity-js/serenity-js/commit/cf4ca2c531e0f90f9a27917e322359c13bfbc6e6))
* **web:** ensure all Web interactions extend the same base class ([b358c0b](https://github.com/serenity-js/serenity-js/commit/b358c0b67c1de11af63e1e2142d3613692769cd6))
* **web:** fixed the interaction to Select ([10b7b74](https://github.com/serenity-js/serenity-js/commit/10b7b7446743b5866a1b458577ea7d2e11bf5a8f))
* **web:** optimised PhotoTakingStrategy ([085b7f7](https://github.com/serenity-js/serenity-js/commit/085b7f716033b22207af47edac58c896f46af62d))
* **web:** removed incorrect export ([ebf80c0](https://github.com/serenity-js/serenity-js/commit/ebf80c019af4db2a847e4b98599bce02b8acef23))
* **web:** removed incorrect import ([90cb025](https://github.com/serenity-js/serenity-js/commit/90cb0251a00a7bff098376110dcec2f9f2c5d5c0))
* **web:** removed window-specific APIs from BrowseTheWeb that got replaced by Page ([918f447](https://github.com/serenity-js/serenity-js/commit/918f447c1d8f326fbf5730f1aa61108045556212)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** renamed Element and associated classes to PageElement to avoid name conflicts ([1e4204b](https://github.com/serenity-js/serenity-js/commit/1e4204b5507469e6574c87a6d84454e39e8a813e))
* **web:** renamed PageElementList to PageElements to improve readability ([a9903a7](https://github.com/serenity-js/serenity-js/commit/a9903a7389b00106ef94d2bdb9f86a7fd04be541)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** standardised getters across PageElement implementations ([336472b](https://github.com/serenity-js/serenity-js/commit/336472b1a6882412f6a88483e51266909a1d51d0))
* **web:** wordsmithing of interface names ([5a1e76a](https://github.com/serenity-js/serenity-js/commit/5a1e76a9c162370e17238fcccc9f08e109d543c3))


### Features

* **core:** question.about produces "props" that proxy the methods of the underlying model ([f771872](https://github.com/serenity-js/serenity-js/commit/f771872c56b487e404002c3800fc8f3baaed804f))
* **protractor:** compatibility with @serenity-js/web ([9df4db2](https://github.com/serenity-js/serenity-js/commit/9df4db27a6e0ae62bf0d0e679a170d4865041043)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** a common way to run the tests for all the web adapters ([c7e584a](https://github.com/serenity-js/serenity-js/commit/c7e584a9bf288ebc7781affdb720097527e8ed3a))
* **web:** added Page.viewportSize and Page.setViewportSize methods ([4cabbe2](https://github.com/serenity-js/serenity-js/commit/4cabbe21a7fbac3457c6a6ea3d4442a62c3f1f3c))
* **web:** all Screenplay APIs migrated from @serenity-js/webdriverio to @serenity-js/web ([7b6b95d](https://github.com/serenity-js/serenity-js/commit/7b6b95dc255446c29ae213ba2a1d142d426d16c8))
* **webdriverio:** support for native WebdriverIO services ([8d5ad22](https://github.com/serenity-js/serenity-js/commit/8d5ad22594cdb2ebddedc58a30259ca8430e360c))
* **web:** interaction to set a Cookie ([c056439](https://github.com/serenity-js/serenity-js/commit/c056439746a8f57c3edd937b8862f2babb70e94e)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** introduced UIElementQuestion to help ensure no NPEs in UI-related questions ([fe29121](https://github.com/serenity-js/serenity-js/commit/fe29121118d630e9fbd73dca85496e20948e26e0))
* **web:** migrated Photographer from @serenity-js/protractor to @serenity-js/web ([4506dac](https://github.com/serenity-js/serenity-js/commit/4506dacebdf955c32c4eff17bf9982c8e45e2925)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** ModalDialog available for both Protractor and WebdriverIO adapters ([ef3c566](https://github.com/serenity-js/serenity-js/commit/ef3c566aed12b52aa22c54058992d369172b8597)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** new module @serenity-js/web to provide Web-related Screenplay Pattern APIs ([bead861](https://github.com/serenity-js/serenity-js/commit/bead8612af1a5c99b775e680a3904f44d0281cf9))
* **web:** page provides an abstraction around browser window ([2e70a3b](https://github.com/serenity-js/serenity-js/commit/2e70a3b6af2e8cc49255820e8a1aaffcc71b76a8))
* **web:** Page.url() and Page.title() replace Website.url() and Website.title() ([49fe009](https://github.com/serenity-js/serenity-js/commit/49fe0094422ab53ec67d4ba303f80c33e382eebd)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** removed Target in favour of PageElement ([69496c4](https://github.com/serenity-js/serenity-js/commit/69496c47c4a1ec7b92e7ab6c83da1559e926f28e)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** support for switching browsing context ([a73a635](https://github.com/serenity-js/serenity-js/commit/a73a635f93183d67229acde78e74526564008869)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** support for working with cookies ([39cde6d](https://github.com/serenity-js/serenity-js/commit/39cde6de7a36d27a8b1c596493efbec94900af6b)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)


### BREAKING CHANGES

* **core:** Introduced @serenity-js/web - a shared library for Serenity/JS Web integration
modules such as @serenity-js/protractor and @serenity-js/webdriverio. Dropped support for Node 12.
