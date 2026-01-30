# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.39.0](https://github.com/serenity-js/serenity-js/compare/v3.38.0...v3.39.0) (2026-01-30)


### Bug Fixes

* **deps:** update dependency jasmine to v5.13.0 ([f0cb621](https://github.com/serenity-js/serenity-js/commit/f0cb6218b41485084c8c177fe1e56558ba7b8fd0))
* **deps:** update playwright dependencies to v1.58.1 ([e28d298](https://github.com/serenity-js/serenity-js/commit/e28d298e1154fcac0842d1e4bf02267ed6ecf453))


### Features

* **jasmine:** add support for Jasmine 6 ([cdd767c](https://github.com/serenity-js/serenity-js/commit/cdd767caca1d273e5c26a0b8e16ff7460d1ffedb))





# [3.38.0](https://github.com/serenity-js/serenity-js/compare/v3.37.2...v3.38.0) (2026-01-29)


### Bug Fixes

* **deps:** update react monorepo ([a38b826](https://github.com/serenity-js/serenity-js/commit/a38b826633e73bc1b979802133af880b9cd6fc10))
* **deps:** update rest dependencies ([6821ab3](https://github.com/serenity-js/serenity-js/commit/6821ab3217c0d3ad0bc5c017ae4214e08226a815))


### Features

* **core:** event SceneFinishes includes the outcome of the test scenario ([37cc14e](https://github.com/serenity-js/serenity-js/commit/37cc14ee48a746592e0b9e9f430a2416b150db3e)), closes [#3005](https://github.com/serenity-js/serenity-js/issues/3005)
* **webdriverio:** support afterTest hooks ([a79c83c](https://github.com/serenity-js/serenity-js/commit/a79c83cf0d2b975f9d7831dbf8cbe6dc1cc4935d)), closes [#3005](https://github.com/serenity-js/serenity-js/issues/3005)


### Reverts

* Revert "test(web): update error message regex patterns to include location info" ([9559b6e](https://github.com/serenity-js/serenity-js/commit/9559b6eaafb5faf25af09c80104e7a19a1d031e8))





## [3.37.2](https://github.com/serenity-js/serenity-js/compare/v3.37.1...v3.37.2) (2026-01-23)


### Bug Fixes

* **deps:** update dependency @cucumber/cucumber to v12.6.0 ([376f720](https://github.com/serenity-js/serenity-js/commit/376f720741aedadeaf5ef8709c430ada9dc72a0e))
* **deps:** update dependency body-parser to v2.2.2 ([05f2a84](https://github.com/serenity-js/serenity-js/commit/05f2a843d2bf24b3a0afda7a0567500c60129acb))
* **deps:** update dependency diff to v8 [security] ([1b3cd88](https://github.com/serenity-js/serenity-js/commit/1b3cd8801ed3c71486fbdc0ca643870d78597a43))
* **deps:** update playwright dependencies to v1.58.0 ([45b74d0](https://github.com/serenity-js/serenity-js/commit/45b74d075848935399d46eda7fe24682d01ed90a))
* **deps:** update webdriverio dependencies ([b928423](https://github.com/serenity-js/serenity-js/commit/b9284233b6bc324e5182fe89373908d802d66b7a))
* **playwright:** use standard CSS selectors instead of the deprecated :light selector engine ([8d33bf8](https://github.com/serenity-js/serenity-js/commit/8d33bf84d9a9321b97e96a9a477e01543e474e88))





## [3.37.1](https://github.com/serenity-js/serenity-js/compare/v3.37.0...v3.37.1) (2025-12-16)


### Bug Fixes

* **deps:** update dependency @cucumber/cucumber to v12.4.0 ([f6238bb](https://github.com/serenity-js/serenity-js/commit/f6238bb27f185138a53caf2163dbd0c2984475b0))
* **deps:** update dependency express to v5.2.1 ([485fb4c](https://github.com/serenity-js/serenity-js/commit/485fb4c90fcfd6cc80be9e03f6f7debf0698e278))
* **deps:** update react monorepo to v19.2.1 ([47734e2](https://github.com/serenity-js/serenity-js/commit/47734e2cbe7166e6f232c0dd154921d59cdd6968))
* **deps:** update react monorepo to v19.2.3 ([1a95d97](https://github.com/serenity-js/serenity-js/commit/1a95d9770d9f8b8a7ada0db8193b25bdc4dc3a93))
* **deps:** update webdriverio dependencies ([dc0692a](https://github.com/serenity-js/serenity-js/commit/dc0692a12482f5a6c933db69ebe3b4a6a92d194e))





# [3.37.0](https://github.com/serenity-js/serenity-js/compare/v3.36.2...v3.37.0) (2025-12-02)


### Bug Fixes

* **deps:** update dependency @cucumber/cucumber to v12.3.0 ([7056e71](https://github.com/serenity-js/serenity-js/commit/7056e7129928f7e1db57ed6e7657ffa8bfd486ed))
* **deps:** update dependency body-parser to v2.2.1 [security] ([0738ce8](https://github.com/serenity-js/serenity-js/commit/0738ce8d63428f2d989db40d39f64cb1893cd897))
* **deps:** update dependency express to v5.2.0 [security] ([99a34b3](https://github.com/serenity-js/serenity-js/commit/99a34b3a555324755ae15ba4ea82245c9057adef))
* **deps:** update dependency jasmine to v5.13.0 ([9e924c0](https://github.com/serenity-js/serenity-js/commit/9e924c0458b380126245f033c5b95b96ac4ac57b))
* **deps:** update dependency lru-cache to v11.2.4 ([5325516](https://github.com/serenity-js/serenity-js/commit/53255161e3b3ef77fe26ee72c5d40bbac6a2a5b4))


### Features

* **playwright-test:** introduced axios fixture ([a836746](https://github.com/serenity-js/serenity-js/commit/a83674697531622d522c6924db2875188efcc834))
* **playwright-test:** support for providing extraAbilities without overriding the actors ([5e189ca](https://github.com/serenity-js/serenity-js/commit/5e189caa4f4a0f38287f8586f21d8106c7c7dab3))
* **playwright-test:** useBase supports merging multiple base fixtures ([e37ed77](https://github.com/serenity-js/serenity-js/commit/e37ed77ae2cc8c18349096cc82668cf522d2e7f1))





## [3.36.2](https://github.com/serenity-js/serenity-js/compare/v3.36.1...v3.36.2) (2025-11-26)


### Bug Fixes

* **deps:** update playwright dependencies to v1.57.0 ([800445e](https://github.com/serenity-js/serenity-js/commit/800445eca508112ab2dd9fd1f1101113c6091fe3))
* **deps:** update webdriverio dependencies to ^9.20.1 ([1d89e8b](https://github.com/serenity-js/serenity-js/commit/1d89e8bb8f5ec03386afdef0eacdab802c7d6940))





## [3.36.1](https://github.com/serenity-js/serenity-js/compare/v3.36.0...v3.36.1) (2025-11-16)


### Bug Fixes

* **deps:** update dependency tiny-types to v1.24.3 ([952a453](https://github.com/serenity-js/serenity-js/commit/952a453936326d154389b79bfd3b04f4b75d0688))
* **local-server:** updated examples in API docs ([32f99b0](https://github.com/serenity-js/serenity-js/commit/32f99b0620e91d00252a74ea435e5fed9c060da8))





# [3.36.0](https://github.com/serenity-js/serenity-js/compare/v3.35.3...v3.36.0) (2025-11-06)


### Bug Fixes

* **deps:** update dependency @paralleldrive/cuid2 to v2.3.1 ([e7fb0b5](https://github.com/serenity-js/serenity-js/commit/e7fb0b51dc502942152cdb4a64d347df0520831a))
* **deps:** update dependency axios to v1.13.2 ([9f8d6cc](https://github.com/serenity-js/serenity-js/commit/9f8d6cc34ecf2cbd121380bd584f509b1416e675))
* **playwright:** corrected handling of pages closed during the test ([adbd35c](https://github.com/serenity-js/serenity-js/commit/adbd35c9b2ae83b63bd7541461646891f5951b2d)), closes [#3054](https://github.com/serenity-js/serenity-js/issues/3054)


### Features

* **core:** introduced support for Node 24, dropped support for Node 18 (EOL) ([9dd5f88](https://github.com/serenity-js/serenity-js/commit/9dd5f885d8e65cd8ff3429a2af94151fbe9134ed))





## [3.35.3](https://github.com/serenity-js/serenity-js/compare/v3.35.2...v3.35.3) (2025-10-30)


### Bug Fixes

* **deps:** update dependency axios to v1.12.0 [security] ([640e95f](https://github.com/serenity-js/serenity-js/commit/640e95f9f8ee83640592966f1b5909c0773efde0))
* **deps:** update dependency axios to v1.12.0 [security] ([343ab7a](https://github.com/serenity-js/serenity-js/commit/343ab7aa371f51d346a1da2b6f11e81d1251b109))
* **deps:** update dependency semver to v7.7.3 ([4d73e21](https://github.com/serenity-js/serenity-js/commit/4d73e2127068088d42aa751acf730097a4e3a426))
* **deps:** update playwright dependencies to v1.56.1 ([fcb5348](https://github.com/serenity-js/serenity-js/commit/fcb5348a7b3e4f09f8f1f9be7bd7dbc35110e701))





## [3.35.2](https://github.com/serenity-js/serenity-js/compare/v3.35.1...v3.35.2) (2025-10-06)


### Bug Fixes

* **deps:** update dependency jasmine to v5.12.0 ([b8c97e5](https://github.com/serenity-js/serenity-js/commit/b8c97e59a52aae0be8edd79ffe7544785d088fd6))
* **deps:** update dependency typescript to v5.9.3 ([fb0bbf6](https://github.com/serenity-js/serenity-js/commit/fb0bbf6bd4c59ec559e9b895ca5f4e27d875c64e))
* **deps:** update playwright dependencies to v1.56.0 ([053db06](https://github.com/serenity-js/serenity-js/commit/053db06755d1f5b6b44739ba698327dcdb06fe32))
* **deps:** update react monorepo to v19.2.0 ([308f7dc](https://github.com/serenity-js/serenity-js/commit/308f7dc09631267d8528274cfb3170bc41bd4555))





## [3.35.1](https://github.com/serenity-js/serenity-js/compare/v3.35.0...v3.35.1) (2025-09-28)


### Bug Fixes

* **deps:** update dependency jasmine to v5.11.0 ([0e6bb9a](https://github.com/serenity-js/serenity-js/commit/0e6bb9a925b0b01c30329e7b0c02592869054577))
* **deps:** update dependency lru-cache to v11.2.2 ([d306404](https://github.com/serenity-js/serenity-js/commit/d3064047d7efe6e14f73cbe2cec467cd1929c58e))
* **deps:** update dependency portfinder to v1.0.38 ([f7d85fb](https://github.com/serenity-js/serenity-js/commit/f7d85fbc136dfc2fde0100548edecbabfb25a166))
* **deps:** update playwright dependencies to v1.55.1 ([53a98fe](https://github.com/serenity-js/serenity-js/commit/53a98fe0d655c12e317e060a2d617e0ceba43206))
* **deps:** update webdriverio dependencies to ^9.20.0 ([8f712fa](https://github.com/serenity-js/serenity-js/commit/8f712fa6cd1d2b843046d21e1123f7a844a995ff))





# [3.35.0](https://github.com/serenity-js/serenity-js/compare/v3.34.2...v3.35.0) (2025-09-07)


### Features

* **web:** support for identifying page elements by their ARIA role ([cf3672a](https://github.com/serenity-js/serenity-js/commit/cf3672a6fe3051eab9c195f2f342ebf55c19e2d6))





## [3.34.2](https://github.com/serenity-js/serenity-js/compare/v3.34.1...v3.34.2) (2025-09-07)


### Bug Fixes

* **deps:** update dependency @cucumber/cucumber to v12.2.0 ([0162244](https://github.com/serenity-js/serenity-js/commit/016224465f46491c8de9bb60122d107e93a8080b))
* **deps:** update dependency jasmine to v5.10.0 ([aea8e61](https://github.com/serenity-js/serenity-js/commit/aea8e61cb5866909a0f3e2c8100f9adea7a8ff87))
* **deps:** update dependency lru-cache to v11.2.1 ([c9e41eb](https://github.com/serenity-js/serenity-js/commit/c9e41ebfd4ab7cd5a9c0d475c0e8f3dd8f9ec466))
* **deps:** update webdriverio dependencies to ^9.19.2 ([599123d](https://github.com/serenity-js/serenity-js/commit/599123d6047c2c07270b6ad1e2059fae05b632c0))





## [3.34.1](https://github.com/serenity-js/serenity-js/compare/v3.34.0...v3.34.1) (2025-08-20)


### Bug Fixes

* **deps:** update dependency tiny-types to v1.24.1 ([14c705a](https://github.com/serenity-js/serenity-js/commit/14c705a83bd7b38dec34529fbb7875168dbc7f3c))
* **deps:** update playwright dependencies to v1.55.0 ([6b501cb](https://github.com/serenity-js/serenity-js/commit/6b501cbf975e6e1bf7729ccf245a858ab586b074))
* **deps:** update webdriverio dependencies to ^9.19.1 ([d8f26e1](https://github.com/serenity-js/serenity-js/commit/d8f26e120cf1dffb3d100c14bed9676f07c4cb20))





# [3.34.0](https://github.com/serenity-js/serenity-js/compare/v3.33.1...v3.34.0) (2025-08-01)


### Bug Fixes

* **deps:** update dependency typescript to v5.9.2 ([8a40483](https://github.com/serenity-js/serenity-js/commit/8a40483203534445d93c5be6f4d8a747055fd79e))
* **deps:** update playwright dependencies to v1.54.2 ([b6b9413](https://github.com/serenity-js/serenity-js/commit/b6b9413ae87d1247a23f93dc26285eb6836b98ec))
* **deps:** update react monorepo ([#2934](https://github.com/serenity-js/serenity-js/issues/2934)) ([b713b52](https://github.com/serenity-js/serenity-js/commit/b713b524ac4ae391e505b903eb5e69c5406d8807))


### Features

* **rest:** support for bypassing proxy for selected urls ([ab1f41a](https://github.com/serenity-js/serenity-js/commit/ab1f41a98f121b4fc95e7a0fbea2c2393bba032d))





## [3.33.1](https://github.com/serenity-js/serenity-js/compare/v3.33.0...v3.33.1) (2025-07-28)


### Bug Fixes

* **core:** refactored Tag deserialiser to simplify the import graph ([ec2c333](https://github.com/serenity-js/serenity-js/commit/ec2c333ed4127d898319d0d9932d09cf545e4508))
* **core:** support for deserialising ProjectTags ([47f650a](https://github.com/serenity-js/serenity-js/commit/47f650a026bbe812eff98dbe89658baa99371d0d))





# [3.33.0](https://github.com/serenity-js/serenity-js/compare/v3.32.5...v3.33.0) (2025-07-28)


### Features

* **cucumber:** support for Cucumber 12 ([61c84a6](https://github.com/serenity-js/serenity-js/commit/61c84a6c3279a97d13f38687800f2eaee676f33b))





## [3.32.5](https://github.com/serenity-js/serenity-js/compare/v3.32.4...v3.32.5) (2025-07-28)


### Bug Fixes

* **deps:** update dependency axios to v1.11.0 ([62df65c](https://github.com/serenity-js/serenity-js/commit/62df65c932e69dcc307033f0f2a1f66a6d80d08e))
* **deps:** update dependency jasmine to v5.9.0 ([c3dfa4b](https://github.com/serenity-js/serenity-js/commit/c3dfa4b77ad2058aaf8132174378bcc27fe50928))
* **deps:** update dependency morgan to v1.10.1 ([d38f692](https://github.com/serenity-js/serenity-js/commit/d38f692d7f04c2322a8574d08fe506075c0788f1))
* **deps:** update dependency validate-npm-package-name to v6.0.2 ([280c3ac](https://github.com/serenity-js/serenity-js/commit/280c3acd410e46c87150d5804952479433ba7d3f))
* **deps:** update webdriverio dependencies ([fa9b857](https://github.com/serenity-js/serenity-js/commit/fa9b8576a42d5cb24f60480bdd7c74dc340a02aa))





## [3.32.4](https://github.com/serenity-js/serenity-js/compare/v3.32.3...v3.32.4) (2025-07-13)


### Bug Fixes

* **core:** removed unnecessary tsconfig files from build artifacts ([6e4d4fa](https://github.com/serenity-js/serenity-js/commit/6e4d4fabed5d0bc2847bbf7cbc4ead10710ec32b))
* **deps:** update dependency agent-base to v7.1.4 ([658ec4d](https://github.com/serenity-js/serenity-js/commit/658ec4d494916a02a15ff68a566b15e3672bba00))
* **deps:** update playwright dependencies to v1.54.1 ([d7fda0e](https://github.com/serenity-js/serenity-js/commit/d7fda0e24bf93f880a988b6772d0f562f7900af2))
* **deps:** update webdriverio dependencies ([47a9611](https://github.com/serenity-js/serenity-js/commit/47a9611701112921731e03055ca646b4c2183c23))





## [3.32.3](https://github.com/serenity-js/serenity-js/compare/v3.32.2...v3.32.3) (2025-07-07)


### Bug Fixes

* **core:** remove dependency on cuid2 from the FileSystem class ([26ad2a3](https://github.com/serenity-js/serenity-js/commit/26ad2a331b0b8f30dbe65f6f62758ab426ef8dc3))
* **core:** use 'node:' prefix for core node module imports ([b1775d5](https://github.com/serenity-js/serenity-js/commit/b1775d51f8e19e9ae0b140ec67aa07dd1391234d))
* **deps:** update playwright dependencies to v1.53.2 ([40ac26d](https://github.com/serenity-js/serenity-js/commit/40ac26d4f8e201457bfbba51c9aa57058e7745eb))
* **deps:** update webdriverio dependencies to ^9.16.2 ([b0cc8aa](https://github.com/serenity-js/serenity-js/commit/b0cc8aa54997ee8f6e8f28a3e46b33f65a25adbb))
* **playwright-test:** support for reporting on programmatically skipped scenarios ([2c154d1](https://github.com/serenity-js/serenity-js/commit/2c154d1a7b0deb62d2d83bd58dc025318db2d4d3))





## [3.32.2](https://github.com/serenity-js/serenity-js/compare/v3.32.1...v3.32.2) (2025-06-21)


### Bug Fixes

* **deps:** update webdriverio dependencies to ^9.15.0 ([48c5ed5](https://github.com/serenity-js/serenity-js/commit/48c5ed52269fc75c6a99318d1dab854961dd3709))
* **serenity-bdd:** correctly escape HTML entities in scenario parameter descriptions ([708942e](https://github.com/serenity-js/serenity-js/commit/708942e98d7c165bb3c2f74e829015f7a2d26d3c)), closes [#2879](https://github.com/serenity-js/serenity-js/issues/2879)
* **serenity-bdd:** upgraded Serenity BDD CLI jar to 4.2.34 ([fadf10a](https://github.com/serenity-js/serenity-js/commit/fadf10a9174b6466da2adbd60d658bc67eb7bbaf))
* **webdriverio:** support for WebdriverIO 9.15 ([133d35e](https://github.com/serenity-js/serenity-js/commit/133d35e3423b612a6001b3beabf35105b39b0b8c))





## [3.32.1](https://github.com/serenity-js/serenity-js/compare/v3.32.0...v3.32.1) (2025-06-20)


### Bug Fixes

* **playwright-test:** added SerenityFixtures and SerenityWorkerFixtures to API docs ([887a7cf](https://github.com/serenity-js/serenity-js/commit/887a7cfb2d5505cd566cc26defdf6d1aaa145e40))





# [3.32.0](https://github.com/serenity-js/serenity-js/compare/v3.31.17...v3.32.0) (2025-06-20)


### Bug Fixes

* **core:** retain the Stage when Serenity is re-configured ([03f74bf](https://github.com/serenity-js/serenity-js/commit/03f74bfe33349f2fa5b32e0a10ceb1f57047dc3b))
* **deps:** update playwright dependencies to v1.53.1 ([6ea14ce](https://github.com/serenity-js/serenity-js/commit/6ea14ce83f307ff8e3e2cd48d5a3f532efb123c3))
* **playwright-test:** create an output directory for the event stream only when necessary ([33c2c60](https://github.com/serenity-js/serenity-js/commit/33c2c60d9ca6610e4211865e3a97f6d094854faa))
* **playwright-test:** retryable tests are no longer marked as "retried" if they pass upon first try ([e027284](https://github.com/serenity-js/serenity-js/commit/e027284f6994f1a46a800ca0990aa901a222210c))
* **playwright:** marked all properties of ExtraBrowserContextOptions as optional ([3ee0145](https://github.com/serenity-js/serenity-js/commit/3ee0145890d0619cc0f4786b9addad429a41f278))
* **serenity-bdd:** append ProjectTag to test name, if available ([f9174f0](https://github.com/serenity-js/serenity-js/commit/f9174f08661e9d45373cd0eee06382edb463bde0))
* **serenity-bdd:** upgraded Serenity BDD CLI to 4.2.30 ([e93cfb7](https://github.com/serenity-js/serenity-js/commit/e93cfb7646912070ceb9be9cd86322889972eab2))


### Features

* **playwright-test:** actorCalled fixture available in beforeAll and afterAll hooks ([e3b2be5](https://github.com/serenity-js/serenity-js/commit/e3b2be5d173c93dd9955f6a4af41bef09d6e6e6c))
* **playwright-test:** aggregate retried test reports, filter tests by project ([6cc46db](https://github.com/serenity-js/serenity-js/commit/6cc46dbc073134dd6956fff04208c1e574f38b05))
* **playwright-test:** improved error handling of actor interactions in beforeAll and afterAll hooks ([2987bee](https://github.com/serenity-js/serenity-js/commit/2987beea84fc2db653054ab09ac71d922ee2352b))
* **playwright-test:** new internal Serenity/JS event reporting mechanism ([42ba5ad](https://github.com/serenity-js/serenity-js/commit/42ba5ad70f1bf99aad8bc5d57de462cac7c7da6c))
* **playwright-test:** report a test as passing if it passed upon a retry ([47e84fe](https://github.com/serenity-js/serenity-js/commit/47e84feec894497bd88211726389bdd38cc9edd9))
* **playwright-test:** serenity fixture is now available in the worker scope ([9f3a8be](https://github.com/serenity-js/serenity-js/commit/9f3a8bea93a4d7f45872a8b320d88cf4a1a11d40))
* **playwright-test:** support for reporting repeated tests ([47b864d](https://github.com/serenity-js/serenity-js/commit/47b864d79aee9b374bb6b6a86b2a313b6c22f584))
* **playwright-test:** support reporting actor interactions from beforeAll and afterAll hooks ([3909545](https://github.com/serenity-js/serenity-js/commit/3909545feba931f77bd846645cecc3c8f575208e))
* **playwright:** refactored SerenityFixtures, corrected BrowseTheWebWithPlaywright parameters ([9c62723](https://github.com/serenity-js/serenity-js/commit/9c627233bc93e38a8ae6e9ba531c31ba05ab707f))





## [3.31.17](https://github.com/serenity-js/serenity-js/compare/v3.31.16...v3.31.17) (2025-06-16)


### Bug Fixes

* **deps:** update dependency axios to v1.10.0 ([43b49a0](https://github.com/serenity-js/serenity-js/commit/43b49a0adfb3b2b5525a4dd18ca678454021c542))
* **deps:** update dependency jasmine to v5.8.0 ([09deaa5](https://github.com/serenity-js/serenity-js/commit/09deaa577f19ae058ccb9c1afdc87f8d2d57cfe0))
* **deps:** update playwright dependencies to v1.53.0 ([3404f12](https://github.com/serenity-js/serenity-js/commit/3404f12005fb2185a06566da233be73e4e8cde8d))





## [3.31.16](https://github.com/serenity-js/serenity-js/compare/v3.31.15...v3.31.16) (2025-06-05)


### Bug Fixes

* **deps:** update dependency @cucumber/cucumber to v11.3.0 ([4bc35ed](https://github.com/serenity-js/serenity-js/commit/4bc35ed22ed3b23a2068148e45e1fc0247dedd22))
* **deps:** update dependency semver to v7.7.2 ([41dbee8](https://github.com/serenity-js/serenity-js/commit/41dbee88e6cd3c8b7b0ad1c8c073eaca2615ee52))
* **deps:** update dependency validate-npm-package-name to v6.0.1 ([fcc6781](https://github.com/serenity-js/serenity-js/commit/fcc6781cd3a629c863f59e924ce39ade1b47ce71))





## [3.31.15](https://github.com/serenity-js/serenity-js/compare/v3.31.14...v3.31.15) (2025-05-06)


### Bug Fixes

* **deps:** update dependency express to v5 ([355bb7b](https://github.com/serenity-js/serenity-js/commit/355bb7b2e0812d4ae9559a025e08731620791b8b))
* **deps:** update dependency express to v5 ([175995f](https://github.com/serenity-js/serenity-js/commit/175995f91671d51b1ad5724dfb7060dfbfc2571e))
* **deps:** update dependency jasmine to ^5.7.1 ([66c8bad](https://github.com/serenity-js/serenity-js/commit/66c8badcb6df358dce7cd82ac9068dacc8c985e9))





## [3.31.14](https://github.com/serenity-js/serenity-js/compare/v3.31.13...v3.31.14) (2025-04-28)


### Bug Fixes

* **deps:** update dependency body-parser to v2 ([e358f2f](https://github.com/serenity-js/serenity-js/commit/e358f2f413c8c34524dd5ad718db25b364c0747f))
* **deps:** update dependency jasmine to v5.7.0 ([1857fd6](https://github.com/serenity-js/serenity-js/commit/1857fd6b842b237ab5f08e64f6b2f412d399a825))
* **deps:** update dependency portfinder to v1.0.37 ([ab24ac2](https://github.com/serenity-js/serenity-js/commit/ab24ac2009ff2fcfe8834fe8a3c73c1696d182f4))
* **deps:** update dependency typescript to v5.8.3 ([b19c09b](https://github.com/serenity-js/serenity-js/commit/b19c09b5e5e7d05e744bc0c8b0b49cd3af89483c))
* **deps:** update playwright dependencies to v1.52.0 ([fc5faed](https://github.com/serenity-js/serenity-js/commit/fc5faed239ea7af4f7c90f2345e8ff42257bd3ef))
* **deps:** update react monorepo to v19.1.0 ([#2802](https://github.com/serenity-js/serenity-js/issues/2802)) ([7174bc1](https://github.com/serenity-js/serenity-js/commit/7174bc18c99a0330c90da3d5f9250d960a90dbfb))
* **deps:** update rest dependencies ([6331afb](https://github.com/serenity-js/serenity-js/commit/6331afbe32c439808b317d497043dd6deb513801))
* **deps:** update webdriverio dependencies ([4df3ff2](https://github.com/serenity-js/serenity-js/commit/4df3ff222a113618d990ffb08f609a895c56de57))





## [3.31.13](https://github.com/serenity-js/serenity-js/compare/v3.31.12...v3.31.13) (2025-03-20)


### Bug Fixes

* **deps:** update dependency axios to v1.8.4 ([3f94d9a](https://github.com/serenity-js/serenity-js/commit/3f94d9a30305dabdd855f549a4518784b8377e0f))
* **deps:** update dependency portfinder to v1.0.35 ([f1becee](https://github.com/serenity-js/serenity-js/commit/f1becee2c37af62df5c51439a96df92907187444))
* **deps:** update playwright dependencies to v1.51.1 ([8d059c2](https://github.com/serenity-js/serenity-js/commit/8d059c2fb9ec5d6091b664a24a771205d96f2040))





## [3.31.12](https://github.com/serenity-js/serenity-js/compare/v3.31.11...v3.31.12) (2025-03-12)


### Bug Fixes

* **deps:** update dependency axios to v1.8.2 [security] ([2653f35](https://github.com/serenity-js/serenity-js/commit/2653f352166bca4e46572a1b2d26ee1ae197a038))
* **deps:** update local server dependencies ([a4086ac](https://github.com/serenity-js/serenity-js/commit/a4086ac9bdd5b34740e91d56e33343edee8fe5b6))
* **deps:** update playwright dependencies to v1.51.0 ([81dfdd4](https://github.com/serenity-js/serenity-js/commit/81dfdd4a4514d3f5b90a6c2cda7b54330f4e1d61))
* **deps:** update webdriverio 8 dependencies to ^8.43.0 ([b783c5c](https://github.com/serenity-js/serenity-js/commit/b783c5c6b83adfde3a0417d93d6ed42f5037e122))
* **deps:** update webdriverio dependencies ([843e78a](https://github.com/serenity-js/serenity-js/commit/843e78a4d8781aad32c25c6c22b101ec524720a4))
* **playwright-test:** removed stop-gap type defs since Playwright now provides them correctly ([91d2484](https://github.com/serenity-js/serenity-js/commit/91d2484de8b508f672ac637b3bad121bd0d9487a)), closes [microsoft/playwright#24146](https://github.com/microsoft/playwright/issues/24146)





## [3.31.11](https://github.com/serenity-js/serenity-js/compare/v3.31.10...v3.31.11) (2025-03-12)

**Note:** Version bump only for package serenity-js-monorepo





## [3.31.10](https://github.com/serenity-js/serenity-js/compare/v3.31.9...v3.31.10) (2025-03-05)


### Bug Fixes

* **deps:** update dependency axios to v1.8.1 ([0ec3014](https://github.com/serenity-js/serenity-js/commit/0ec3014baa55dc39cdd6a907d268ef806173d272))
* **deps:** update dependency typescript to v5.8.2 ([228c7fd](https://github.com/serenity-js/serenity-js/commit/228c7fddee3afcbf5015b147eeb816494ef6bd08))
* **deps:** update local server dependencies ([2499ed8](https://github.com/serenity-js/serenity-js/commit/2499ed84a8ddd05d65793546988df3e2170edee5))
* **deps:** update webdriverio dependencies to ^9.10.1 ([9ea82f8](https://github.com/serenity-js/serenity-js/commit/9ea82f8fd37a20f131883aaf13ac35b2f51d12aa))





## [3.31.9](https://github.com/serenity-js/serenity-js/compare/v3.31.8...v3.31.9) (2025-02-20)


### Bug Fixes

* **deps:** update dependency jasmine to ^5.6.0 ([27933a3](https://github.com/serenity-js/serenity-js/commit/27933a345a0bb148f98e73a83e3715adb93761cd))
* **deps:** update webdriverio dependencies ([b49e006](https://github.com/serenity-js/serenity-js/commit/b49e006223b96b7ae2a69e304965b0e7ef4d3e19))
* **webdriverio-8:** handle windows and tabs closed by JavaScript ([#2745](https://github.com/serenity-js/serenity-js/issues/2745)) ([a8c50c7](https://github.com/serenity-js/serenity-js/commit/a8c50c74a273ed31a0b0bd7794450813fd3a683c))





## [3.31.8](https://github.com/serenity-js/serenity-js/compare/v3.31.7...v3.31.8) (2025-02-04)


### Bug Fixes

* **deps:** update dependency semver to v7.7.1 ([640931b](https://github.com/serenity-js/serenity-js/commit/640931bc7a4886ae10497480744004710cd45549))
* **deps:** update playwright dependencies to v1.50.1 ([66f4946](https://github.com/serenity-js/serenity-js/commit/66f494629f8198d19912cfc9fc5b578cc01da844))
* **deps:** update webdriverio dependencies to ^9.7.2 ([26b0d4b](https://github.com/serenity-js/serenity-js/commit/26b0d4b58fd7c2c8a550fdf7675fc870dacee90d))





## [3.31.7](https://github.com/serenity-js/serenity-js/compare/v3.31.6...v3.31.7) (2025-01-24)


### Bug Fixes

* **deps:** update playwright dependencies to v1.50.0 ([30ca259](https://github.com/serenity-js/serenity-js/commit/30ca2599ead451d190b780bff858f801077b26b7))
* **deps:** update webdriverio dependencies to ^9.6.2 ([1a2786d](https://github.com/serenity-js/serenity-js/commit/1a2786d1b3963d291067ce10680f14a4bbb31bdf))
* **deps:** update webdriverio dependencies to ^9.6.3 ([f8ac41f](https://github.com/serenity-js/serenity-js/commit/f8ac41f57c0a92ec97312b0086b750dea7f6682f))
* **deps:** update webdriverio dependencies to ^9.6.4 ([18ec054](https://github.com/serenity-js/serenity-js/commit/18ec05451070f65a15fa1059b24e3873dcb11a3a))
* **deps:** update webdriverio dependencies to ^9.7.0 ([b25f161](https://github.com/serenity-js/serenity-js/commit/b25f161b6894dc3c3b0817db93815eab75b6c079))





## [3.31.6](https://github.com/serenity-js/serenity-js/compare/v3.31.5...v3.31.6) (2025-01-16)


### Bug Fixes

* **deps:** update react monorepo to v19 ([#2631](https://github.com/serenity-js/serenity-js/issues/2631)) ([0f3b9bf](https://github.com/serenity-js/serenity-js/commit/0f3b9bf2a4901df5e14eb3e64033e02583a33bf9))
* **deps:** update webdriverio dependencies to ^9.5.7 ([2aff990](https://github.com/serenity-js/serenity-js/commit/2aff9906e0a83f72fe84082d18a01b0a858ed89e))
* **serenity-bdd:** correctly escape HTML entities in activity descriptions ([386c8ae](https://github.com/serenity-js/serenity-js/commit/386c8aef1805d795c4bf2771f49c40c4c2e0c705)), closes [#2695](https://github.com/serenity-js/serenity-js/issues/2695)
* **serenity-bdd:** upgraded Serenity BDD CLI to 4.2.12 ([243729d](https://github.com/serenity-js/serenity-js/commit/243729d8b2eb03f24827a88818044efde58b43c8))





## [3.31.5](https://github.com/serenity-js/serenity-js/compare/v3.31.4...v3.31.5) (2025-01-11)


### Bug Fixes

* **core:** added more context to the ArtifactArchived event ([9f10867](https://github.com/serenity-js/serenity-js/commit/9f108678e5b356e98dd4b2c672364b6c378f2af8))
* **core:** target ES2023 to match TypeScript recommendation for Node 18 and above ([e7fc4d9](https://github.com/serenity-js/serenity-js/commit/e7fc4d93a6a5d2b4bcce341e9b82fb776142dec9))
* **deps:** update dependency @cucumber/cucumber to v11.2.0 ([74be0e6](https://github.com/serenity-js/serenity-js/commit/74be0e65bbfa530a45e634079998d1094bc35b44))
* **deps:** update dependency fast-glob to v3.3.3 ([93cf07e](https://github.com/serenity-js/serenity-js/commit/93cf07ec7e3cab9d682ef657a4cb4c56c50024bb))
* **deps:** update dependency typescript to v5.7.3 ([cd87dd8](https://github.com/serenity-js/serenity-js/commit/cd87dd80ea55e73bac48afd9c670191a10dc97c4))
* **deps:** update webdriverio dependencies ([9955bfa](https://github.com/serenity-js/serenity-js/commit/9955bfa115da6ac329feec49275629dbcba10f69))
* **serenity-bdd:** corrected reporting of retried examples in Cucumber scenario outlines ([30c7f77](https://github.com/serenity-js/serenity-js/commit/30c7f772256b9a6bf764331ae03c0ac4b8a25c77)), closes [#2448](https://github.com/serenity-js/serenity-js/issues/2448) [#2676](https://github.com/serenity-js/serenity-js/issues/2676)
* **serenity-bdd:** upgraded Serenity BDD CLI to 4.2.11 ([30cd640](https://github.com/serenity-js/serenity-js/commit/30cd640d3e1ac8af41eee614a1eaf1abf7d5bd7b))





## [3.31.4](https://github.com/serenity-js/serenity-js/compare/v3.31.3...v3.31.4) (2025-01-01)


### Bug Fixes

* **deps:** update webdriverio dependencies to ^9.5.0 ([8c2f959](https://github.com/serenity-js/serenity-js/commit/8c2f95901a3edb36791b042f180260f84853dc69))





## [3.31.3](https://github.com/serenity-js/serenity-js/compare/v3.31.2...v3.31.3) (2025-01-01)


### Bug Fixes

* **core:** migrated to PNPM ([43dbe6f](https://github.com/serenity-js/serenity-js/commit/43dbe6f440d8dd81811da303e542381a17d06b4d)), closes [#2664](https://github.com/serenity-js/serenity-js/issues/2664)





## [3.31.2](https://github.com/serenity-js/serenity-js/compare/v3.31.1...v3.31.2) (2024-12-26)


### Bug Fixes

* **deps:** update webdriverio 8 dependencies to ^8.41.0 ([aa2892a](https://github.com/serenity-js/serenity-js/commit/aa2892acb182e1b1aa8493dc128cf77043503205))
* **deps:** update webdriverio dependencies ([a3b0048](https://github.com/serenity-js/serenity-js/commit/a3b0048a67921171e16183216502e39d717dc98a))





## [3.31.1](https://github.com/serenity-js/serenity-js/compare/v3.31.0...v3.31.1) (2024-12-17)


### Bug Fixes

* **deps:** update cucumber ([9b10345](https://github.com/serenity-js/serenity-js/commit/9b1034569659d065d86f6e6f2ea2bf1cb2b206c4))
* **deps:** update cucumber ([515f93a](https://github.com/serenity-js/serenity-js/commit/515f93a8e012fae435ae0f3ddbfae0370b29d9a7))
* **deps:** update dependency agent-base to v7.1.3 ([d43bf84](https://github.com/serenity-js/serenity-js/commit/d43bf84d6202c5df5871fdfab25e834c14b315ff))
* **deps:** update dependency express to v4.21.2 ([50cded9](https://github.com/serenity-js/serenity-js/commit/50cded9ecb7d25e66c656994f6360dd3af2bd545))
* **deps:** update dependency https-proxy-agent to v7.0.6 ([e235e40](https://github.com/serenity-js/serenity-js/commit/e235e404eaee60431fd0474b02b3343bd9477272))
* **deps:** update playwright dependencies to v1.49.1 ([7f576dd](https://github.com/serenity-js/serenity-js/commit/7f576ddf31363968da5b8dacd013803f4cde7a2b))
* **deps:** update webdriverio dependencies to ^9.4.2 ([9a9249a](https://github.com/serenity-js/serenity-js/commit/9a9249a25076ab87622d6ac9126768764be5cc82))
* **playwright:** support playwright ~1.49.0 ([d2e3bae](https://github.com/serenity-js/serenity-js/commit/d2e3bae8148adcb59661f94eb175bce4d76217f7))





# [3.31.0](https://github.com/serenity-js/serenity-js/compare/v3.30.0...v3.31.0) (2024-12-12)


### Bug Fixes

* **web:** aligned the behaviour of Page.current() methods when switching to frames and iframes ([01d9db6](https://github.com/serenity-js/serenity-js/commit/01d9db68550506c0815fc211e9454b6a4bbc2299)), closes [#2575](https://github.com/serenity-js/serenity-js/issues/2575)
* **webdriverio:** corrected handling of browser windows closed by test script ([c604baa](https://github.com/serenity-js/serenity-js/commit/c604baa104d128ea00e85f88ad7d20ae0d5b4607))
* **webdriverio:** corrected unexpected open alert error handling ([f78b97b](https://github.com/serenity-js/serenity-js/commit/f78b97b6f8c4de443edce615986d91240715fcd5)), closes [#2572](https://github.com/serenity-js/serenity-js/issues/2572)
* **webdriverio:** simplified the implementation of page.setViewportSize ([e8551d3](https://github.com/serenity-js/serenity-js/commit/e8551d3c91d7cebf0fc04feba4fbe7faef7bd2df)), closes [#2572](https://github.com/serenity-js/serenity-js/issues/2572)
* **webdriverio:** support for WebdriverIO 9.4.1 ([bd9128c](https://github.com/serenity-js/serenity-js/commit/bd9128cbe06c148220ba553db494bbedb40bf408)), closes [#2572](https://github.com/serenity-js/serenity-js/issues/2572)
* **webdriverio:** support ModalDialog handling with WebdriverIO 9 ([6640136](https://github.com/serenity-js/serenity-js/commit/6640136b38b060983bf23c9f869a90223b8e90de)), closes [#2572](https://github.com/serenity-js/serenity-js/issues/2572)
* **webdriverio:** upgraded to WDIO 9.2.12 to incorporate the frame handling fix ([f908a3e](https://github.com/serenity-js/serenity-js/commit/f908a3ec8bf3b6b4168d08c0e349de903f3ffcaa)), closes [#2572](https://github.com/serenity-js/serenity-js/issues/2572)
* **webdriverio:** upgraded WebdriverIO deps to 9.3.0 ([deedf71](https://github.com/serenity-js/serenity-js/commit/deedf7151c6c9eee4ae36112214e32de269b70ba)), closes [#2572](https://github.com/serenity-js/serenity-js/issues/2572)
* **webdriverio:** upgraded WebdriverIO to 9.2.11 ([07f26f6](https://github.com/serenity-js/serenity-js/commit/07f26f61425c3b59812b67b39bd5142b9490bc57)), closes [webdriverio/webdriverio#13857](https://github.com/webdriverio/webdriverio/issues/13857)
* **webdriverio:** use BiDi command to set viewport size if available ([f351f10](https://github.com/serenity-js/serenity-js/commit/f351f10c40680edae3deba3b78bc78f7947c7d4d)), closes [#2572](https://github.com/serenity-js/serenity-js/issues/2572)
* **webdriverio:** use webdriver protocol switchToFrame instead of webdriverio switchFrame ([30debe8](https://github.com/serenity-js/serenity-js/commit/30debe8cc070af8ac88b0eeb8833fd6fc279f15f)), closes [#2572](https://github.com/serenity-js/serenity-js/issues/2572)


### Features

* **mocha:** support for Mocha 11 ([82b831c](https://github.com/serenity-js/serenity-js/commit/82b831cef1ed7c3b8c8d62026af3e69aecc45461))
* **webdriverio-8:** introduced @serenity-js/webdriverio-8 module to continue supporting WDIO 8 ([8a010b1](https://github.com/serenity-js/serenity-js/commit/8a010b1fd8b2422a9f76f5ad38e37cabadc33abe)), closes [#2572](https://github.com/serenity-js/serenity-js/issues/2572)
* **webdriverio:** introduced support for WebdriverIO 9 ([88fae7b](https://github.com/serenity-js/serenity-js/commit/88fae7bc5472f585293194706f846cdd4c6e4c58)), closes [#2572](https://github.com/serenity-js/serenity-js/issues/2572) [#1279](https://github.com/serenity-js/serenity-js/issues/1279) [webdriverio/webdriverio#13610](https://github.com/webdriverio/webdriverio/issues/13610)





# [3.30.0](https://github.com/serenity-js/serenity-js/compare/v3.29.5...v3.30.0) (2024-11-19)


### Bug Fixes

* **core:** updated dependency on validate-npm-package-name ([1ef87d9](https://github.com/serenity-js/serenity-js/commit/1ef87d994608ad09dd856d9d102c70acee5fc4f5))
* **deps:** update playwright dependencies to v1.49.0 ([9d98f8e](https://github.com/serenity-js/serenity-js/commit/9d98f8e0d46004f8b3fa7e2f32ee0a03ce88558f))
* **playwright-test:** correctly report nested error cause ([1eab582](https://github.com/serenity-js/serenity-js/commit/1eab5828932934effe40716525a76e471119d836)), closes [microsoft/playwright#26848](https://github.com/microsoft/playwright/issues/26848) [#1823](https://github.com/serenity-js/serenity-js/issues/1823)


### Features

* **serenity-bdd:** vend Serenity BDD CLI jar file as part of @serenity-js/serenity-bdd package ([ef95d2a](https://github.com/serenity-js/serenity-js/commit/ef95d2a9b37ba5eeae1abed8a0994a18c172debc)), closes [#2560](https://github.com/serenity-js/serenity-js/issues/2560)





## [3.29.5](https://github.com/serenity-js/serenity-js/compare/v3.29.4...v3.29.5) (2024-11-03)


### Bug Fixes

* **deps:** update playwright dependencies to v1.48.2 ([e8dc2bd](https://github.com/serenity-js/serenity-js/commit/e8dc2bd008f19738a5e343b4f30b2008afaded57))





## [3.29.4](https://github.com/serenity-js/serenity-js/compare/v3.29.3...v3.29.4) (2024-10-08)


### Bug Fixes

* **deps:** update playwright dependencies to v1.48.0 ([54e8c32](https://github.com/serenity-js/serenity-js/commit/54e8c32e67e558751a8915949bb80b1bb3962e36))





## [3.29.3](https://github.com/serenity-js/serenity-js/compare/v3.29.2...v3.29.3) (2024-10-08)


### Bug Fixes

* **deps:** update dependency which to v5 ([554f868](https://github.com/serenity-js/serenity-js/commit/554f868940c85b3ea4a4731e1ab55e40c995dcb2))





## [3.29.2](https://github.com/serenity-js/serenity-js/compare/v3.29.1...v3.29.2) (2024-09-25)


### Bug Fixes

* **core:** added implementation examples to Numeric API docs ([5365ec4](https://github.com/serenity-js/serenity-js/commit/5365ec4f92f17a9b835e8a5de0880c38558de520))





## [3.29.1](https://github.com/serenity-js/serenity-js/compare/v3.29.0...v3.29.1) (2024-09-24)


### Bug Fixes

* **core:** code clean-up ([c95e32b](https://github.com/serenity-js/serenity-js/commit/c95e32b880949c0dd085d64c6fad46680f14c9f8))





# [3.29.0](https://github.com/serenity-js/serenity-js/compare/v3.28.0...v3.29.0) (2024-09-24)


### Bug Fixes

* **core:** improved precision of results calculated by Numeric.sum() ([d82a23d](https://github.com/serenity-js/serenity-js/commit/d82a23d95572fedcca297bd79d555325f96ea460)), closes [#2420](https://github.com/serenity-js/serenity-js/issues/2420)
* **deps:** update playwright dependencies to v1.47.2 ([be26cb2](https://github.com/serenity-js/serenity-js/commit/be26cb2773e418788fd4b9142f65c7782a618290))


### Features

* **core:** added Numeric.sum() arithmetic function ([5ed15ec](https://github.com/serenity-js/serenity-js/commit/5ed15ec2ea90655fc45aa54a0b30c2e089265d18)), closes [#2420](https://github.com/serenity-js/serenity-js/issues/2420)
* **core:** introduced Numeric.difference() ([97e7f5e](https://github.com/serenity-js/serenity-js/commit/97e7f5e396787b8eb9a51983b60aa191f5bfb8f8)), closes [#2420](https://github.com/serenity-js/serenity-js/issues/2420)
* **core:** introduced Numeric.floor() and Numeric.ceiling() functions ([dbe892b](https://github.com/serenity-js/serenity-js/commit/dbe892b8f064a84f907d60bb5594ad900645a631)), closes [#2420](https://github.com/serenity-js/serenity-js/issues/2420)
* **core:** introduced Numeric.intValue(), .bigIntValue() and floatValue() meta-questions ([bab710e](https://github.com/serenity-js/serenity-js/commit/bab710e1e6c92045561159a6a89462f6a3b6ee67)), closes [#2420](https://github.com/serenity-js/serenity-js/issues/2420)
* **core:** introduced Numeric.max() and Numeric.min() ([f310bb0](https://github.com/serenity-js/serenity-js/commit/f310bb002ca30abb163bdeeff5764b0f4971ad03)), closes [#2420](https://github.com/serenity-js/serenity-js/issues/2420)
* **core:** standardised arithmetic function APIs so that they can be used to map collection items ([8817ad4](https://github.com/serenity-js/serenity-js/commit/8817ad4ecfdef411eee0f5af8f1ccd73d6eb0806)), closes [#2420](https://github.com/serenity-js/serenity-js/issues/2420)





# [3.28.0](https://github.com/serenity-js/serenity-js/compare/v3.27.0...v3.28.0) (2024-09-11)


### Bug Fixes

* **cucumber:** upgraded to Cucumber Messages 26.0.0 ([6099a02](https://github.com/serenity-js/serenity-js/commit/6099a020c00bcd49350c630ff4f0760a33098999))


### Features

* **cucumber:** support for Cucumber 11 ([4c7b881](https://github.com/serenity-js/serenity-js/commit/4c7b8814b928918168853bca59d1c3fb667db95a))





# [3.27.0](https://github.com/serenity-js/serenity-js/compare/v3.26.1...v3.27.0) (2024-09-06)


### Bug Fixes

* **core:** updated npm tags to improve discoverability ([432d331](https://github.com/serenity-js/serenity-js/commit/432d331aedb7b46fdd5291394521923ce66c1a2b))
* **deps:** update dependency lru-cache to v11.0.1 ([d2c61a7](https://github.com/serenity-js/serenity-js/commit/d2c61a7690f8a1a523314f56ff1e8252bc3f3357))
* **deps:** update playwright dependencies to v1.47.0 ([0641e49](https://github.com/serenity-js/serenity-js/commit/0641e493c04c220562ec415c70afb2d80c387944))


### Features

* **core:** added support for Node 22, dropped support for Node 16 ([d5dea01](https://github.com/serenity-js/serenity-js/commit/d5dea013ed5d87f2e0cda8fa83da9fd021e4638d)), closes [#2518](https://github.com/serenity-js/serenity-js/issues/2518)





## [3.26.1](https://github.com/serenity-js/serenity-js/compare/v3.26.0...v3.26.1) (2024-09-03)


### Bug Fixes

* **core:** updated diff to 6.0.0 ([d7718e1](https://github.com/serenity-js/serenity-js/commit/d7718e150ec2a81aa1ebe5e8dd3b89cda476306b))





# [3.26.0](https://github.com/serenity-js/serenity-js/compare/v3.25.5...v3.26.0) (2024-08-27)


### Features

* **core:** final state of the actor's notepad is included in Serenity BDD report ([56c9fb8](https://github.com/serenity-js/serenity-js/commit/56c9fb88514657df51c82fd8ab642514ed8e3416))
* **core:** introduced specialised events to mark actors' exit from the stage ([b0b3f0c](https://github.com/serenity-js/serenity-js/commit/b0b3f0cb85790cd83b170271a15b91029c7b43a3))
* **core:** new event ActorEntersStage and associated models ([11702b6](https://github.com/serenity-js/serenity-js/commit/11702b6fc21fa00f1ff8dcc0f1169090b1a97f72))
* **core:** new event ActorEntersStage is emitted upon invoking actorCalled for the first time ([1498c21](https://github.com/serenity-js/serenity-js/commit/1498c2103e5ab4dc3958a4236a8e26ff2848e6c0))
* **core:** new method actor.toJSON lets you inspect the actor and its abilities ([ace3323](https://github.com/serenity-js/serenity-js/commit/ace3323ea5db8771734259db450e65cb58275794))
* **rest:** final state of the actor's ability to CallAnApi is included in Serenity BDD report ([e000a16](https://github.com/serenity-js/serenity-js/commit/e000a1687780b0789728e0e0ef11864d1c14e532))
* **serenity-bdd:** include details of actors and their abilities in Serenity BDD reports ([df38495](https://github.com/serenity-js/serenity-js/commit/df384952345ff3e8614b8fe8c36cb0be21dc6a80))
* **serenity-bdd:** reporting actors' abilities can be toggled ([5bea8ff](https://github.com/serenity-js/serenity-js/commit/5bea8ffa8870a4a1128403e65b79ce852ca79abe))
* **serenity-bdd:** upgraded Serenity BDD CLI to 4.1.20 ([2cf3d53](https://github.com/serenity-js/serenity-js/commit/2cf3d53bced9052b8670a9cef4967ff53eb86e8f))





## [3.25.5](https://github.com/serenity-js/serenity-js/compare/v3.25.4...v3.25.5) (2024-08-18)


### Bug Fixes

* **cucumber:** support for Cucumber.js 10.9.0 ([6c9ba70](https://github.com/serenity-js/serenity-js/commit/6c9ba70fa3abcdf4c6e9e32864bef9091b86bbc3))
* **deps:** update dependency tiny-types to v1.23.0 ([1c9a897](https://github.com/serenity-js/serenity-js/commit/1c9a897c100398632366bdef84d9dfde03f1af3c))
* **deps:** update playwright dependencies to v1.46.1 ([5cbed5d](https://github.com/serenity-js/serenity-js/commit/5cbed5d9f4f9e02d5824744791ddee2e7672f07e))





## [3.25.4](https://github.com/serenity-js/serenity-js/compare/v3.25.3...v3.25.4) (2024-08-07)


### Bug Fixes

* **deps:** update playwright dependencies to v1.46.0 ([000d43a](https://github.com/serenity-js/serenity-js/commit/000d43ae468595e78fdf5341b0d89432c3cc270a))





## [3.25.3](https://github.com/serenity-js/serenity-js/compare/v3.25.2...v3.25.3) (2024-07-25)


### Bug Fixes

* **deps:** update playwright dependencies to v1.45.3 ([89775e6](https://github.com/serenity-js/serenity-js/commit/89775e6b535b62c4a705db6ae463fd50be51c2bd))
* **local-server:** marked dependency on express as optional ([ea43a9a](https://github.com/serenity-js/serenity-js/commit/ea43a9a5a886062368bd81d349d58f00ae4be63c))
* **playwright:** playwright is now a peer dependency ([d9c7307](https://github.com/serenity-js/serenity-js/commit/d9c73073b57f1394efec0860f23b193b5ff53d97))





## [3.25.2](https://github.com/serenity-js/serenity-js/compare/v3.25.1...v3.25.2) (2024-07-17)


### Bug Fixes

* **deps:** update dependency lru-cache to v10.4.3 ([966a17c](https://github.com/serenity-js/serenity-js/commit/966a17c1df5d92508642aa5b34b6a4d1a1a4eafc))
* **deps:** update dependency sass to v1.77.8 ([1a11ae5](https://github.com/serenity-js/serenity-js/commit/1a11ae54c438a01ee7a4eb7c5c9a22d075cafa9d))
* **deps:** update playwright dependencies to v1.45.2 ([bf1d934](https://github.com/serenity-js/serenity-js/commit/bf1d934f5b9feca2b59192d4524d55e130b7bb80))





## [3.25.1](https://github.com/serenity-js/serenity-js/compare/v3.25.0...v3.25.1) (2024-07-10)


### Bug Fixes

* **core:** all the API docs now link to the online Serenity/JS API documentation ([f8f451d](https://github.com/serenity-js/serenity-js/commit/f8f451dffdb4caaa2e31a860f59d59470f4856ad))





# [3.25.0](https://github.com/serenity-js/serenity-js/compare/v3.24.1...v3.25.0) (2024-07-03)


### Bug Fixes

* **deps:** update dependency https-proxy-agent to v7.0.5 ([d4d618b](https://github.com/serenity-js/serenity-js/commit/d4d618bb950ee3726535df7987ed2c3f57d3a452))
* **deps:** update dependency lru-cache to v10.3.0 ([52ceee3](https://github.com/serenity-js/serenity-js/commit/52ceee3c934fc9db634f6d69fe6cdebf7831a70e))
* **deps:** update dependency proxy to v2.2.0 ([5cb26bf](https://github.com/serenity-js/serenity-js/commit/5cb26bf76b97b5ac87ec12290814809b1f24f40c))
* **deps:** update playwright dependencies to v1.45.1 ([16cb866](https://github.com/serenity-js/serenity-js/commit/16cb8663a925affcde5718de760e34bda938147e))
* **web:** renamed PageElement.outerHtml to PageElement.html for consistency with other methods ([9df6e0f](https://github.com/serenity-js/serenity-js/commit/9df6e0f2eece966d50ddac92e7550baa72bcb5f1))


### Features

* **web:** outerHtml lets you retrieve the HTML content of the given PageElement ([1bb6c6a](https://github.com/serenity-js/serenity-js/commit/1bb6c6afbfea3fb0c8883f9fe4aec385aa12ac27))





## [3.24.1](https://github.com/serenity-js/serenity-js/compare/v3.24.0...v3.24.1) (2024-06-26)


### Bug Fixes

* **deps:** update playwright dependencies to v1.45.0 ([ef7eb4a](https://github.com/serenity-js/serenity-js/commit/ef7eb4aa6bca0aee2d20afadcc15ba0c56c1e28a))





# [3.24.0](https://github.com/serenity-js/serenity-js/compare/v3.23.2...v3.24.0) (2024-06-18)


### Bug Fixes

* **core:** aggregated the various internal reflection functions under ValueInspector ([4c9ce32](https://github.com/serenity-js/serenity-js/commit/4c9ce329bd82970a9166844286571e0fab58b7b5)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **cucumber:** support for Cucumber 10.8.0 ([689f4c8](https://github.com/serenity-js/serenity-js/commit/689f4c8e3b2dc0d846a8c75ad22b58592d7a282f)), closes [#2140](https://github.com/serenity-js/serenity-js/issues/2140)
* **deps:** update dependency sass to v1.77.4 ([df5955a](https://github.com/serenity-js/serenity-js/commit/df5955a66ff99630dacc98628e35ad6f1ce43c04))
* **deps:** update dependency sass to v1.77.6 ([860ebbb](https://github.com/serenity-js/serenity-js/commit/860ebbbf0d825cad9a7e081a2f11558a7b2db71a))


### Features

* **assertions:** dynamic descriptions for assertions and expectations ([3fdc7c8](https://github.com/serenity-js/serenity-js/commit/3fdc7c83880d58f509c8b9e9e2494167a99444f0)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **console-reporter:** support for repording dynamic interaction descriptions ([bbe5e5e](https://github.com/serenity-js/serenity-js/commit/bbe5e5e78065a827fcbebfd594aa9f5a0e481391)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **core:** dynamic descriptions for Wait.for and Wait.until ([d000f46](https://github.com/serenity-js/serenity-js/commit/d000f4664b5528352a6c7abd770831da34f90f00)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **core:** initial description of a Question can now be dynamic ([7c428cc](https://github.com/serenity-js/serenity-js/commit/7c428cc4ef0668f71399028a1998d15bd18f576b)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **core:** nested properties returned by QuestionAdapters are now reported as their formatted value ([35f2e3e](https://github.com/serenity-js/serenity-js/commit/35f2e3e217e94e771c85cb49d1afa81bfc0873b3)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **core:** notes are now reported using their actual value rather than their description ([584373a](https://github.com/serenity-js/serenity-js/commit/584373ac5b3fceb54320891b93c981a4c671b93e)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **core:** support for dynamic descriptions for Questions ([aac9a8f](https://github.com/serenity-js/serenity-js/commit/aac9a8f5dbc5b6f4664373f5462aa171baecdcf8)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **core:** support for dynamic descriptions for Tasks and Interactions ([c1516f2](https://github.com/serenity-js/serenity-js/commit/c1516f2b1acb5937ad22012914ce38e15abe1276)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **core:** the - new tag template function to help you create dynamic descriptions of activities ([98288dd](https://github.com/serenity-js/serenity-js/commit/98288dd5ef2a9af570b20d373cf46198665dc473)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **core:** the - tag literal function now accepts meta-questions as parameters ([a7b58b6](https://github.com/serenity-js/serenity-js/commit/a7b58b6f145aa0a708e329497d24aef004d46bed)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **serenity-bdd:** support for reporting dynamic descriptions of Tasks and Interactions ([8737f55](https://github.com/serenity-js/serenity-js/commit/8737f55c804ae5cc02366b287de36d17c0bff133)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **web:** all Serenity/JS Web interaction and questions use dynamic descriptions ([1deca07](https://github.com/serenity-js/serenity-js/commit/1deca07feadcd4cf3cbfc3d220f7895b829c3deb)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)
* **web:** dynamic description of the interaction to Enter.theValue(..) ([fc92409](https://github.com/serenity-js/serenity-js/commit/fc9240926f1c2a61d52adaf4daa5f52f8b1b7087)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)





## [3.23.2](https://github.com/serenity-js/serenity-js/compare/v3.23.1...v3.23.2) (2024-05-24)


### Bug Fixes

* **deps:** update playwright dependencies to v1.44.1 ([8a602c9](https://github.com/serenity-js/serenity-js/commit/8a602c9905b8a64eda99a8c223303aa983d9752f))





## [3.23.1](https://github.com/serenity-js/serenity-js/compare/v3.23.0...v3.23.1) (2024-05-20)


### Bug Fixes

* **core:** allow relative Path to resolve to '.' ([be527a2](https://github.com/serenity-js/serenity-js/commit/be527a258cd1d6f797ef3ffdcc9a6b0118e8d2fa))
* **deps:** update dependency axios to v1.7.0 ([7baf7c3](https://github.com/serenity-js/serenity-js/commit/7baf7c340f63ab7a7cf661be3a3835087e168c80))
* **deps:** update dependency sass to v1.77.2 ([c3ad4c0](https://github.com/serenity-js/serenity-js/commit/c3ad4c0c27142fe2202f6c3dcc500dd1e83109f8))
* **rest:** upgraded Axios to 1.7.1 ([83566b7](https://github.com/serenity-js/serenity-js/commit/83566b73f3ccd4f0db222c841a95fc2f428759b8))





# [3.23.0](https://github.com/serenity-js/serenity-js/compare/v3.22.4...v3.23.0) (2024-05-12)


### Bug Fixes

* **deps:** update dependency sass to v1.77.1 ([a9d7258](https://github.com/serenity-js/serenity-js/commit/a9d7258107d02c2b158cbba5fc727458e405cd63))


### Features

* **core:** exported isPlainObject utility function as part of /lib/io ([7f2c5fd](https://github.com/serenity-js/serenity-js/commit/7f2c5fd94cc68ac2249d1e0285933e96794f4493))
* **core:** new utility method Question.fromArray to complement Question.fromObject ([4007bf1](https://github.com/serenity-js/serenity-js/commit/4007bf1310d0eb0ce2b3e10fe97955f0ad9ef087))
* **playwright:** standardised ExecuteScript argument transmission across WebdriverIO and Playwright ([adfc171](https://github.com/serenity-js/serenity-js/commit/adfc171aa5073ec57d6896bbd824013e5844eda4))
* **protractor:** standardised ExecuteScript argument transmission across all web integration tools ([1a08f47](https://github.com/serenity-js/serenity-js/commit/1a08f47c32a01af76cafae55af23582167e2bd88))
* **webdriverio:** support for injecting scripts parameterised with complex data structures ([e920e67](https://github.com/serenity-js/serenity-js/commit/e920e6709262c8249c992ac02a01f49d5789a35d))
* **web:** scripts injected into the browser accept data structures containing PageElement objects ([2fbddf5](https://github.com/serenity-js/serenity-js/commit/2fbddf5d78d2965aecd6786b020c93ea079bdaf1))





## [3.22.4](https://github.com/serenity-js/serenity-js/compare/v3.22.3...v3.22.4) (2024-05-07)


### Bug Fixes

* **deps:** update dependency sass to v1.77.0 ([a43874f](https://github.com/serenity-js/serenity-js/commit/a43874f63509100b31588ca4c9bb20c25be383d9))
* **deps:** update playwright dependencies to v1.44.0 ([ae659d6](https://github.com/serenity-js/serenity-js/commit/ae659d6bbd389805061a163ac8e38386363636ec))





## [3.22.3](https://github.com/serenity-js/serenity-js/compare/v3.22.2...v3.22.3) (2024-05-01)


### Bug Fixes

* **deps:** update dependency cytoscape to v3.29.2 ([de21b6c](https://github.com/serenity-js/serenity-js/commit/de21b6c2e892f7e9e7b8c3fb50c7a2ad69031114))
* **deps:** update dependency lru-cache to v10.2.2 ([35b9e75](https://github.com/serenity-js/serenity-js/commit/35b9e7583bae52376a1d7071881e3ddda85a36cb))
* **deps:** update dependency sass to v1.76.0 ([71573d5](https://github.com/serenity-js/serenity-js/commit/71573d5ad5f33379f901432b00ac838a95f71293))
* **playwright:** ensure ExecuteScript runs in the context of the currently active iframe ([3592ca0](https://github.com/serenity-js/serenity-js/commit/3592ca067a942e428d337515644233be003e6e36))
* **webdriverio:** support switching to parent frame when using Appium ([1faba64](https://github.com/serenity-js/serenity-js/commit/1faba6461a8a5a09f33c398f6f27c67d0c5d617b)), closes [appium/appium#14882](https://github.com/appium/appium/issues/14882)





## [3.22.2](https://github.com/serenity-js/serenity-js/compare/v3.22.1...v3.22.2) (2024-04-20)

**Note:** Version bump only for package serenity-js-monorepo





## [3.22.1](https://github.com/serenity-js/serenity-js/compare/v3.22.0...v3.22.1) (2024-04-17)


### Bug Fixes

* **deps:** update dependency sass to v1.75.0 ([7a7136f](https://github.com/serenity-js/serenity-js/commit/7a7136f943a3edfed4c3719ffae7e9734e7fbb62))
* **deps:** update playwright dependencies to v1.43.1 ([fbbb2d4](https://github.com/serenity-js/serenity-js/commit/fbbb2d475f76aaf37ca1fb3f11871bfe91403cb9))





# [3.22.0](https://github.com/serenity-js/serenity-js/compare/v3.21.2...v3.22.0) (2024-04-11)


### Bug Fixes

* **cucumber:** support for Cucumber 10.4.0 ([3aff921](https://github.com/serenity-js/serenity-js/commit/3aff9218a2854bc41f92f509079086e6cdafe5c2))
* **cucumber:** updated cucumber/messages to 24.1.0 ([1ea098b](https://github.com/serenity-js/serenity-js/commit/1ea098b2f912b4a88afabbd67a86e248fd313266))
* **deps:** update dependency sass to v1.74.1 ([a9b73e1](https://github.com/serenity-js/serenity-js/commit/a9b73e1f2962628c978a266a94a6ac940a75652a))
* **deps:** update playwright dependencies to v1.43.0 ([f9a2f9d](https://github.com/serenity-js/serenity-js/commit/f9a2f9d837765843af76ade9a78f92e32e1d884f))
* **playwright-test:** support for Playwright Test 1.43.0 ([0162b6e](https://github.com/serenity-js/serenity-js/commit/0162b6e0b56e5cbf11ab03326181480b740f24ef))


### Features

* **serenity-bdd:** support for Serenity BDD 4.1.6 ([48cbaf6](https://github.com/serenity-js/serenity-js/commit/48cbaf6739730fc72b184b115713585cb22fb513))





## [3.21.2](https://github.com/serenity-js/serenity-js/compare/v3.21.1...v3.21.2) (2024-03-31)


### Bug Fixes

* **deps:** update dependency agent-base to v7.1.1 ([f4d639f](https://github.com/serenity-js/serenity-js/commit/f4d639f1e9ecab5d079ef81450aa29aa362753c6))





## [3.21.1](https://github.com/serenity-js/serenity-js/compare/v3.21.0...v3.21.1) (2024-03-16)


### Bug Fixes

* **core:** upgraded dependency on tiny-types to 1.22.0 ([2c0bb2a](https://github.com/serenity-js/serenity-js/commit/2c0bb2aeee7df7652853606c1ea10794157eb9fb))
* **web:** documented By ([69573aa](https://github.com/serenity-js/serenity-js/commit/69573aa6b4d669546af710bcf9683d1a24967a91))





# [3.21.0](https://github.com/serenity-js/serenity-js/compare/v3.20.0...v3.21.0) (2024-03-04)


### Bug Fixes

* **playwright-test:** support for reporting tags registered using the new Playwright 1.42 tags API ([9d57157](https://github.com/serenity-js/serenity-js/commit/9d571573cd9d8b52ddcb286f1160c7011dea7590))


### Features

* **jasmine:** support for custom tags ([47f93d8](https://github.com/serenity-js/serenity-js/commit/47f93d86fecc49a793dc5e8052b82f5115ca5b98))
* **mocha:** support for custom tags ([b86f2bb](https://github.com/serenity-js/serenity-js/commit/b86f2bb98305ba2491e7a2728aa38431ea8f716c))





# [3.20.0](https://github.com/serenity-js/serenity-js/compare/v3.19.0...v3.20.0) (2024-03-02)


### Bug Fixes

* **deps:** update playwright dependencies to v1.42.0 ([0058448](https://github.com/serenity-js/serenity-js/commit/0058448c569803b3998bcfa26a787f3894a11d51))
* **deps:** update playwright dependencies to v1.42.1 ([dc20ed5](https://github.com/serenity-js/serenity-js/commit/dc20ed5eb29d41fdb8d87b375c2c7a90a041bdca))
* **serenity-bdd:** fixed feature tag links for nested spec structures ([7f596e5](https://github.com/serenity-js/serenity-js/commit/7f596e5eab2ee401e4ba0c5613a2a0d65986cae7)), closes [#2222](https://github.com/serenity-js/serenity-js/issues/2222)


### Features

* **core:** simplified reading and writing files in CrewMembers using the FileSystem ([7f0d0cc](https://github.com/serenity-js/serenity-js/commit/7f0d0cc6de675a526a6e9351fe94055501d87e2c)), closes [#2244](https://github.com/serenity-js/serenity-js/issues/2244)
* **rest:** createAxios function instantiates axios with HTTP proxy support ([c453678](https://github.com/serenity-js/serenity-js/commit/c4536784c0bd9e77826563b944904fb862c43c83))





# [3.19.0](https://github.com/serenity-js/serenity-js/compare/v3.18.1...v3.19.0) (2024-03-01)


### Bug Fixes

* **console-reporter:** fix comments ([e8b21dd](https://github.com/serenity-js/serenity-js/commit/e8b21ddb40c5addc53bdcfb212770f199f026e11))


### Features

* **console-reporter:** global exception handling v1 ([cf117f1](https://github.com/serenity-js/serenity-js/commit/cf117f16ba6623e45b3bcf0d357a91539700f55b))
* **console-reporter:** revert to only global error handling ([a375788](https://github.com/serenity-js/serenity-js/commit/a3757886275c854c8cc6d55aedbc0d26916cde9f))
* **console-reporter:** test with reporter developement ([85e2bf1](https://github.com/serenity-js/serenity-js/commit/85e2bf1ad06b00aa7d917e762ce0c2e0cb964533))





## [3.18.1](https://github.com/serenity-js/serenity-js/compare/v3.18.0...v3.18.1) (2024-02-23)


### Bug Fixes

* **webdriverio:** removed workaround for webdriverio/webdriverio[#12251](https://github.com/serenity-js/serenity-js/issues/12251) as it's no longer needed ([42da400](https://github.com/serenity-js/serenity-js/commit/42da4004c05b567671ca1825648aff753e218f83))





# [3.18.0](https://github.com/serenity-js/serenity-js/compare/v3.17.0...v3.18.0) (2024-02-17)


### Bug Fixes

* **deps:** update dependency diff to v5.2.0 ([17f5a2e](https://github.com/serenity-js/serenity-js/commit/17f5a2e61576bae958f1f30490da8b24351d08f8))
* **deps:** update dependency http-proxy-agent to v7.0.2 ([cd46c66](https://github.com/serenity-js/serenity-js/commit/cd46c66baf22538a0d2d8c30c3569bc9a5a15e53))
* **deps:** update dependency https-proxy-agent to v7.0.4 ([a9f02f6](https://github.com/serenity-js/serenity-js/commit/a9f02f61186d635821515d756507f0f9f04227f8))
* **deps:** update dependency typedoc-plugin-mdn-links to v3.1.16 ([0563d11](https://github.com/serenity-js/serenity-js/commit/0563d11850a8d148171128afbda616ec46cebd04))


### Features

* **web:** actors can now check if an HTML element attribute is present ([3ce115a](https://github.com/serenity-js/serenity-js/commit/3ce115ab5c27b05b970f529ee0e97c89d46bbde4))





# [3.17.0](https://github.com/serenity-js/serenity-js/compare/v3.16.2...v3.17.0) (2024-02-10)


### Bug Fixes

* **deps:** update dependency typedoc to v0.25.8 ([9b4198d](https://github.com/serenity-js/serenity-js/commit/9b4198d3f10f9499dbe577189b76f5e18003baf2))
* **deps:** update dependency typedoc-plugin-mdn-links to v3.1.15 ([1c2e7b6](https://github.com/serenity-js/serenity-js/commit/1c2e7b6f62e4442544671ab4ddd12fdb04361168))
* **playwright-test:** fix lint issue, refactors and add integration tests to custom tags reporting ([0f055c7](https://github.com/serenity-js/serenity-js/commit/0f055c7f4e0a9f6d29ef20c615c2055baebf85ec))
* **serenity-bdd:** removed dependency on https-proxy-agent as it's no longer required ([acad172](https://github.com/serenity-js/serenity-js/commit/acad172c9899f76640203e639540f9312421351d))


### Features

* **playwright-test:** announce tags automatically if present on the test title ([00b9ef8](https://github.com/serenity-js/serenity-js/commit/00b9ef8dc091835941fb643a9fd07c09a9500aaa))





## [3.16.2](https://github.com/serenity-js/serenity-js/compare/v3.16.1...v3.16.2) (2024-02-05)


### Bug Fixes

* **serenity-bdd:** upgraded Serenity BDD to 4.0.48 ([f99b9cb](https://github.com/serenity-js/serenity-js/commit/f99b9cbb1e5b676c79efbf3c6c5f1171435c3086))





## [3.16.1](https://github.com/serenity-js/serenity-js/compare/v3.16.0...v3.16.1) (2024-02-03)


### Bug Fixes

* **core:** build with TypeScript 5.2 ([2f261ee](https://github.com/serenity-js/serenity-js/commit/2f261ee92ae4d75b1d5b576d30083c8ecacbcb95))
* **deps:** update playwright dependencies to v1.41.2 ([0975517](https://github.com/serenity-js/serenity-js/commit/0975517718d60e877bc9ac256b4fcf146be6c22e))





# [3.16.0](https://github.com/serenity-js/serenity-js/compare/v3.15.1...v3.16.0) (2024-02-01)


### Bug Fixes

* **core:** introduced RequirementsHierarchy to centralise requirements detection logic ([0a3d6f0](https://github.com/serenity-js/serenity-js/commit/0a3d6f013a3b94ca471edc263e1157b7c41131be))
* **core:** recognise `specs` as a potential requirements hierarchy root ([d95d850](https://github.com/serenity-js/serenity-js/commit/d95d85058fd5e4e01aec689b7196989ece5e303f))
* **core:** removed dependency on Moment.js ([edd1d64](https://github.com/serenity-js/serenity-js/commit/edd1d64f30893983b92bd600d102c81577c0ecb1))
* **core:** simplified the Timestampt validation regex and improved error messages ([b453a23](https://github.com/serenity-js/serenity-js/commit/b453a23de419dbd811927b9447c17678e39f8cc8))
* **core:** support for timezones and simplified date time strings when creating Timestamps ([754f8e2](https://github.com/serenity-js/serenity-js/commit/754f8e260d2fc5130075a78ec58084eafcf2c83f))
* **cucumber:** ensure Cucumber adapter emits events with absolute file paths ([f93d9cc](https://github.com/serenity-js/serenity-js/commit/f93d9cc5c405811e5ed1b7ef31b788f2fa92b329))
* **cucumber:** support for Cucumber 10.3.1 ([8f41a03](https://github.com/serenity-js/serenity-js/commit/8f41a03cab5a3c1d46ea2037769e01c101a1e762))
* **deps:** update dependency lru-cache to v10.2.0 ([a580d1e](https://github.com/serenity-js/serenity-js/commit/a580d1e301b7901e78ea87b5a273438562880533))
* **deps:** update dependency typedoc-plugin-mdn-links to v3.1.13 ([92c8652](https://github.com/serenity-js/serenity-js/commit/92c86521ecffc344cd31f70c1583a3807cf5d393))
* **deps:** update dependency typedoc-plugin-mdn-links to v3.1.14 ([fdb2616](https://github.com/serenity-js/serenity-js/commit/fdb261639bcfcfcb0843b5ad177adfed3833a29b))
* **deps:** update playwright dependencies to v1.41.1 ([a1a39ee](https://github.com/serenity-js/serenity-js/commit/a1a39ee2e30506849d4589a9588a5ac7dfb0adb8))
* **serenity-bdd:** upgraded Serenity BDD CLI to 4.0.46 ([218c08f](https://github.com/serenity-js/serenity-js/commit/218c08ffeef6fc1f51654782d896a03b048dca6d))


### Features

* **core:** added Masked.valueOf() Question ([e9ff5ab](https://github.com/serenity-js/serenity-js/commit/e9ff5ab62e8b305aa7ef2238f482be5369d890c1)), closes [#2165](https://github.com/serenity-js/serenity-js/issues/2165)
* **cucumber:** support for nested requirements reporting ([40f8842](https://github.com/serenity-js/serenity-js/commit/40f884273bfac96bde1b028a819d9641e861dc3b))
* **cucumber:** support for nested requirements reporting ([2d0b885](https://github.com/serenity-js/serenity-js/commit/2d0b885d61d7e63445a68d4a14c34240ed4c304e))
* **jasmine:** support for nested requirements reporting ([137fef7](https://github.com/serenity-js/serenity-js/commit/137fef786dfb147576032e171fa0646695b7051e))
* **jasmine:** support for using specDir to indicate the requirements hierarchy root ([585cb81](https://github.com/serenity-js/serenity-js/commit/585cb810a9b312be080549b823bfc586fbd8b3cc))
* **mocha:** support for nested requirements reporting ([f8e70ce](https://github.com/serenity-js/serenity-js/commit/f8e70ce8a317ab6e8bdf4d058110f110b4c8deda))
* **playwright-test:** improved requirements reporting ([3b99112](https://github.com/serenity-js/serenity-js/commit/3b99112b2eb0add2440d88a6485ee23e7acac75e))
* **playwright-test:** support for nested requirements reporting ([37ef679](https://github.com/serenity-js/serenity-js/commit/37ef679bde723af856d94bc64781f189a59213ed))
* **serenity-bdd:** upgraded Serenity BDD to 4.0.44 ([4e2f1e3](https://github.com/serenity-js/serenity-js/commit/4e2f1e3b273712c44a7f749ba9570f121520cdd5))





## [3.15.1](https://github.com/serenity-js/serenity-js/compare/v3.15.0...v3.15.1) (2024-01-19)


### Bug Fixes

* **deps:** update dependency typedoc-plugin-mdn-links to v3.1.12 ([be9f27c](https://github.com/serenity-js/serenity-js/commit/be9f27c050908aa5472b09d9630bfb3a8aa1f8ac))
* **deps:** update playwright dependencies to v1.41.0 ([bb2dc99](https://github.com/serenity-js/serenity-js/commit/bb2dc99bf8c94536a0863c9c60d5461a9b3dfe19))





# [3.15.0](https://github.com/serenity-js/serenity-js/compare/v3.14.2...v3.15.0) (2024-01-12)


### Bug Fixes

* **cucumber:** upgraded Cucumber to 10.2.1 ([2665c4a](https://github.com/serenity-js/serenity-js/commit/2665c4aa5e9b8e26239c9bdff414fb56779c8b1b))
* **deps:** update dependency @giscus/react to v2.4.0 ([30681d5](https://github.com/serenity-js/serenity-js/commit/30681d55ef4e688a51846e3c251df8f4f4e95562))
* **deps:** update dependency moment to v2.30.1 ([42ec5c3](https://github.com/serenity-js/serenity-js/commit/42ec5c3b0052a0f939eec761a06ad83c632c7eb8))
* **deps:** update dependency typedoc-plugin-mdn-links to v3.1.8 ([7a559d0](https://github.com/serenity-js/serenity-js/commit/7a559d005a212105e729ef8f0c390dbf16b0ba03))
* **deps:** update dependency typedoc-plugin-mdn-links to v3.1.9 ([f3d660b](https://github.com/serenity-js/serenity-js/commit/f3d660b0ddea84434ea45beffc8ad847da7f9ebc))
* **deps:** update website dependencies ([a319ffc](https://github.com/serenity-js/serenity-js/commit/a319ffc13cc74a8dfd3fb9fbb121ca8128ae02a9))
* **deps:** update website dependencies ([ee12098](https://github.com/serenity-js/serenity-js/commit/ee12098c81b1c04aeae381253812229e65f5cbb0))
* **serenity-bdd:** upgraded Serenity BDD CLI to 4.0.43 ([e1d22e9](https://github.com/serenity-js/serenity-js/commit/e1d22e92e120c7b6205ffe63dc22ebba5844e7ba)), closes [#1147](https://github.com/serenity-js/serenity-js/issues/1147)


### Features

* **core:** enabled ClassLoader to instantiate StageCrewMembers using their factory functions ([f98bd42](https://github.com/serenity-js/serenity-js/commit/f98bd4206e768d5840d6e7952c61f7a2da1b144e)), closes [#1147](https://github.com/serenity-js/serenity-js/issues/1147)
* **core:** timestamps can be represented as ISO8601-compatible strings ([b19e064](https://github.com/serenity-js/serenity-js/commit/b19e064abdbf5073bc701dd238098aa31ba7fc5a))
* **serenity-bdd:** auto-detect requirements hierarchy root directory ([e2011b0](https://github.com/serenity-js/serenity-js/commit/e2011b0b95565d67e8ee785f3e197f827703a934)), closes [#1147](https://github.com/serenity-js/serenity-js/issues/1147)
* **serenity-bdd:** support for Serenity BDD 4 ([c15c366](https://github.com/serenity-js/serenity-js/commit/c15c3660f957c21c367f8f27218a05d3fbca78de)), closes [#1147](https://github.com/serenity-js/serenity-js/issues/1147)
* **serenity-bdd:** support for Serenity BDD 4 ([0760417](https://github.com/serenity-js/serenity-js/commit/0760417e2fa3e9fbfc78cd9965052531625bf45e))
* **serenity-bdd:** support for Serenity BDD CLI v4.0.40 ([271068e](https://github.com/serenity-js/serenity-js/commit/271068e7ff64659138c5662cd3b8ae93bc7a7438)), closes [#1147](https://github.com/serenity-js/serenity-js/issues/1147)
* **serenity-bdd:** support for Serenity BDD v4 CLI ([6988248](https://github.com/serenity-js/serenity-js/commit/69882485ce28bb18e502b3f49740a4f82aedaa1d)), closes [#1147](https://github.com/serenity-js/serenity-js/issues/1147) [#2042](https://github.com/serenity-js/serenity-js/issues/2042)





## [3.14.2](https://github.com/serenity-js/serenity-js/compare/v3.14.1...v3.14.2) (2023-12-12)


### Bug Fixes

* **playwright-test:** fixed switching between multiple pages ([375f3aa](https://github.com/serenity-js/serenity-js/commit/375f3aaac05843b71a88d56ae0f5e4d99522f10e))
* **playwright:** ignore taking the screenshot if the page is already closed ([fdedeb8](https://github.com/serenity-js/serenity-js/commit/fdedeb8d8ca5fe6406101be930c17ad281a8f26d))





## [3.14.1](https://github.com/serenity-js/serenity-js/compare/v3.14.0...v3.14.1) (2023-12-10)


### Bug Fixes

* **core:** added provenance statements ([04c2d87](https://github.com/serenity-js/serenity-js/commit/04c2d878be0f2d853b14e4fa390f312688b868cf))
* **core:** pinned all the direct dependencies ([498b336](https://github.com/serenity-js/serenity-js/commit/498b33614f678327ba207b30e3b2452728545aaf))
* **protractor:** removed direct dependency on selenium-webdriver 3.6.0 ([33cbd16](https://github.com/serenity-js/serenity-js/commit/33cbd16a1569e97281f8af81d4f7efcc593c6d0a)), closes [#2095](https://github.com/serenity-js/serenity-js/issues/2095)





# [3.14.0](https://github.com/serenity-js/serenity-js/compare/v3.13.3...v3.14.0) (2023-12-02)


### Bug Fixes

* **deps:** update dependency lru-cache to ^10.1.0 ([05700c1](https://github.com/serenity-js/serenity-js/commit/05700c1cb2b0c137a60001934b2b09f5f842cd41))
* **deps:** update playwright dependencies to ^1.40.1 ([da2e7ba](https://github.com/serenity-js/serenity-js/commit/da2e7ba610954a20bd33ccae702f285874484399))
* **playwright-test:** corrected proxy protocol detection and configuration ([090b322](https://github.com/serenity-js/serenity-js/commit/090b322fd54b2c654c6b9ff30a6aaa172b2ac8fd))
* **web:** question about Attribute is now generic and specifies native element type ([c2b7663](https://github.com/serenity-js/serenity-js/commit/c2b76638c4ab87de7a54368820803f13bd54e1f9))
* **web:** removed duplicate quotes in the error message ([4ee1c10](https://github.com/serenity-js/serenity-js/commit/4ee1c10cf0d091f9566b594c4390c2862e62540b))
* **web:** replaced dot in error message by a comma ([d78551e](https://github.com/serenity-js/serenity-js/commit/d78551e5528ee9c1edebcd39ee46fc33e04e031f))


### Features

* **core:** nested error cause is now added to the main error message ([815c8ce](https://github.com/serenity-js/serenity-js/commit/815c8ce54205d813224cb5746e42bc48b7c388c9)), closes [#1823](https://github.com/serenity-js/serenity-js/issues/1823)
* **cucumber:** support for ESNext modules ([ba1f225](https://github.com/serenity-js/serenity-js/commit/ba1f225550149f28ce03bef422c6a5e55e59ad2f)), closes [#2097](https://github.com/serenity-js/serenity-js/issues/2097)
* **web:** question about ComputedStyle retrieves computed style property ([219f9b9](https://github.com/serenity-js/serenity-js/commit/219f9b98cb329d7fac54b953de9727ca2fd28d00)), closes [#1633](https://github.com/serenity-js/serenity-js/issues/1633)





## [3.13.3](https://github.com/serenity-js/serenity-js/compare/v3.13.2...v3.13.3) (2023-11-22)


### Bug Fixes

* **deps:** update dependency lru-cache to ^10.0.3 ([d3c41f8](https://github.com/serenity-js/serenity-js/commit/d3c41f89b905a8b92448d0915e0d985ccc1f0460))
* **deps:** update playwright dependencies to ^1.40.0 ([56c6ec0](https://github.com/serenity-js/serenity-js/commit/56c6ec03aff4db0a7d9bcd4d216c934f551c8dfd))
* **webdriverio:** migrated WebdriverIOPageElement to us WDIO 8.23.4 types ([6881790](https://github.com/serenity-js/serenity-js/commit/68817901cd653d1c0adad2af0c48f52e3c5375ab)), closes [webdriverio/webdriverio#11679](https://github.com/webdriverio/webdriverio/issues/11679)





## [3.13.2](https://github.com/serenity-js/serenity-js/compare/v3.13.1...v3.13.2) (2023-11-14)


### Bug Fixes

* **cucumber:** resolve paths to "imports" as absolute file URLs ([fc9aefc](https://github.com/serenity-js/serenity-js/commit/fc9aefcdc2ec8e1dfe3ce38b03a1ff7fd7d3c6c6)), closes [#2060](https://github.com/serenity-js/serenity-js/issues/2060)
* **deps:** update dependency lru-cache to ^10.0.2 ([b46f93c](https://github.com/serenity-js/serenity-js/commit/b46f93c999fc2dc3e0713e52f8eef9f34d91a283))





## [3.13.1](https://github.com/serenity-js/serenity-js/compare/v3.13.0...v3.13.1) (2023-11-07)


### Bug Fixes

* **deps:** update dependency tiny-types to ^1.21.0 ([d4921f9](https://github.com/serenity-js/serenity-js/commit/d4921f9cedb502487c176216fbf15dd2ef83dcc4))





# [3.13.0](https://github.com/serenity-js/serenity-js/compare/v3.12.0...v3.13.0) (2023-10-19)


### Bug Fixes

* **cucumber:** updated Cucumber Messages to v22 ([b305860](https://github.com/serenity-js/serenity-js/commit/b305860512f6d5a8a368b4942aab49738dc6f236))
* **deps:** update playwright dependencies to ^1.39.0 ([32af6b0](https://github.com/serenity-js/serenity-js/commit/32af6b02cea254cd3dcf5aa2a6318d3145d0af13))


### Features

* **cucumber:** support for Cucumber 10 ([adb3ee5](https://github.com/serenity-js/serenity-js/commit/adb3ee59cb2899ce73cd025c488470c4e3ed05f5))





# [3.12.0](https://github.com/serenity-js/serenity-js/compare/v3.11.1...v3.12.0) (2023-10-09)


### Bug Fixes

* **deps:** update dependency typedoc to ^0.25.2 ([95dfd3d](https://github.com/serenity-js/serenity-js/commit/95dfd3d4d9c83df5ba4f6314ada0e560610f12b6))


### Features

* **jasmine:** support for Jasmine 5 ([ee80215](https://github.com/serenity-js/serenity-js/commit/ee802152d1af7a50665def985fd946fc04e6399d)), closes [#1088](https://github.com/serenity-js/serenity-js/issues/1088) [#913](https://github.com/serenity-js/serenity-js/issues/913)
* **jasmine:** support for Jasmine 5 ([9b34e1e](https://github.com/serenity-js/serenity-js/commit/9b34e1eb9bfe1a1ad507fff569083da429b10f30))
* **protractor:** support for Jasmine 5 ([f638532](https://github.com/serenity-js/serenity-js/commit/f638532da48b56dcc997605175141c67fbeb231e))
* **webdriverio:** support for Jasmine 5 ([881196f](https://github.com/serenity-js/serenity-js/commit/881196f8ab869230e4bc791db7a54cdb685b2e08))





## [3.11.1](https://github.com/serenity-js/serenity-js/compare/v3.11.0...v3.11.1) (2023-10-04)


### Bug Fixes

* **core:** allow for QuestionAdapter\<string\> to proxy .replaceAll() method ([f1200c1](https://github.com/serenity-js/serenity-js/commit/f1200c1648471088c1f2943770c1bb4cc940e22f))
* **deps:** update website dependencies ([06041e9](https://github.com/serenity-js/serenity-js/commit/06041e91ce9800b6ea04640a9ed98f82aa077651))





# [3.11.0](https://github.com/serenity-js/serenity-js/compare/v3.10.4...v3.11.0) (2023-10-03)


### Features

* **assertions:** isBefore and isAfter accept Timestamp as well as Date objects ([55e13d0](https://github.com/serenity-js/serenity-js/commit/55e13d00a447c0ec70dd496fb7948f171977a682))
* **core:** inspecting a Timestamp returns a human-friendly description of its value ([da26b54](https://github.com/serenity-js/serenity-js/commit/da26b5478108c811e52ea8d902dd6c626c843ffc))
* **playwright-test:** enabled the ability to CallAnApi for all default actors ([436cde5](https://github.com/serenity-js/serenity-js/commit/436cde5283c14cea420000389d7c2c73e6122764)), closes [#1876](https://github.com/serenity-js/serenity-js/issues/1876)
* **playwright-test:** explicit proxy config will override env variables for REST interaction ([1c277d6](https://github.com/serenity-js/serenity-js/commit/1c277d6e45064fbb4ab3432c11d125f529268b5c)), closes [#1949](https://github.com/serenity-js/serenity-js/issues/1949)
* **rest:** automatic proxy server configuration for CallAnApi ([27a1630](https://github.com/serenity-js/serenity-js/commit/27a163024120068bc4d5b7ec07704fb774b2e312)), closes [#1949](https://github.com/serenity-js/serenity-js/issues/1949)
* **serenity-bdd:** serenity-bdd downloader will now automatically detect proxy server configuration ([c221210](https://github.com/serenity-js/serenity-js/commit/c221210c95753a518621b5e97f6e037fa9383be1)), closes [#1949](https://github.com/serenity-js/serenity-js/issues/1949)
* **web:** ability to CallAnApi is now available by default ([dfaf8e4](https://github.com/serenity-js/serenity-js/commit/dfaf8e4f4cb40f9be99624f0d616ebcf012c1fb0)), closes [#1876](https://github.com/serenity-js/serenity-js/issues/1876)





## [3.10.4](https://github.com/serenity-js/serenity-js/compare/v3.10.3...v3.10.4) (2023-09-22)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.38.1 ([0072ddb](https://github.com/serenity-js/serenity-js/commit/0072ddbe42cc147e9cce5a7bca79bc87c707e1ce))





## [3.10.3](https://github.com/serenity-js/serenity-js/compare/v3.10.2...v3.10.3) (2023-09-15)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.38.0 ([0b8074b](https://github.com/serenity-js/serenity-js/commit/0b8074b19155a38aa2009049d9a395b7026d12b3))
* **playwright-test:** simplified and documented implementing custom Playwright Test fixtures ([61fc2bc](https://github.com/serenity-js/serenity-js/commit/61fc2bce72c9758658851949afac84d573698677)), closes [microsoft/playwright#24146](https://github.com/microsoft/playwright/issues/24146)
* **rest:** correctly resolve relative paths in REST requests ([1bdf3eb](https://github.com/serenity-js/serenity-js/commit/1bdf3eb05701007c8d640e4529f701862f223480))
* **rest:** improved error messages and error handling for failed requests ([e6eb0c3](https://github.com/serenity-js/serenity-js/commit/e6eb0c36db0979be4c8e861cfe402094b7157024)), closes [#1876](https://github.com/serenity-js/serenity-js/issues/1876)
* **webdriverio:** updated WebdriverIO to 8.16.7 and switched to its new global types ([ecd96b2](https://github.com/serenity-js/serenity-js/commit/ecd96b2623c267923db4f79aa2ccb338f10bb09f))





## [3.10.2](https://github.com/serenity-js/serenity-js/compare/v3.10.1...v3.10.2) (2023-09-10)


### Bug Fixes

* **core:** updated installation instruction in the README ([ec3f277](https://github.com/serenity-js/serenity-js/commit/ec3f2778334abbd7324497ceaa2df9f0560a103e)), closes [#1915](https://github.com/serenity-js/serenity-js/issues/1915)
* **cucumber:** removed publishQuiet config option as it's been removed from Cucumber ([5a880ce](https://github.com/serenity-js/serenity-js/commit/5a880ce6960fc7266fc4ed3489bb91e2dd6ad6c7))
* **deps:** update dependency https-proxy-agent to ^7.0.2 ([dbbd6a9](https://github.com/serenity-js/serenity-js/commit/dbbd6a9fa4f42141fedab889e6dc586e54b7e8b4))





## [3.10.1](https://github.com/serenity-js/serenity-js/compare/v3.10.0...v3.10.1) (2023-09-01)


### Bug Fixes

* **core:** use module: es2020 instead of Node16 to avoid issue nrwl/nx[#18801](https://github.com/serenity-js/serenity-js/issues/18801) ([935e655](https://github.com/serenity-js/serenity-js/commit/935e655a9a707ed8c97797e8b1bfab4e806c984c))
* **deps:** update dependency which to v4 ([592c3e1](https://github.com/serenity-js/serenity-js/commit/592c3e19764632e56528dbffff41f975db3e9528))
* **deps:** update website dependencies ([04b33b5](https://github.com/serenity-js/serenity-js/commit/04b33b579ed8e501fd2037e7b218bc72ad8271d2))
* **webdriverio:** use Node16 module loader ([105be09](https://github.com/serenity-js/serenity-js/commit/105be094af2050e6ec3ae4dbb9768b8d372a5cef))





# [3.10.0](https://github.com/serenity-js/serenity-js/compare/v3.9.1...v3.10.0) (2023-08-23)


### Features

* **web:** chainable `PageElements` ([#1864](https://github.com/serenity-js/serenity-js/issues/1864)) ([4d0c7eb](https://github.com/serenity-js/serenity-js/commit/4d0c7eb97c24fe3ae1eed702773cf3b80f104947))





## [3.9.1](https://github.com/serenity-js/serenity-js/compare/v3.9.0...v3.9.1) (2023-08-18)


### Bug Fixes

* **core:** support iOS window handles in CorrelationId ([4e15e1a](https://github.com/serenity-js/serenity-js/commit/4e15e1aac28bf2952bf578edbf972968c6892270))
* **deps:** update dependency @paralleldrive/cuid2 to ^2.2.2 ([1bec9da](https://github.com/serenity-js/serenity-js/commit/1bec9da27a44dd6f7fed3c68c03e346d87e77cbd))
* **deps:** update playwright dependencies to ^1.37.1 ([3a13bba](https://github.com/serenity-js/serenity-js/commit/3a13bba2611ef8dee4423d8a55a814be041fe63a))





# [3.9.0](https://github.com/serenity-js/serenity-js/compare/v3.8.0...v3.9.0) (2023-08-04)


### Features

* **core:** introduced MetaQuestionAdapter ([b6676fd](https://github.com/serenity-js/serenity-js/commit/b6676fd6ee2a2f67fd56e0642b3af72027d50a75))





# [3.8.0](https://github.com/serenity-js/serenity-js/compare/v3.7.2...v3.8.0) (2023-08-01)


### Bug Fixes

* **serenity-bdd:** corrected screenshot sort order in screenshot detail viewer ([7537622](https://github.com/serenity-js/serenity-js/commit/7537622d41193e3cf358a1b939c7422bcc3b207f)), closes [#1790](https://github.com/serenity-js/serenity-js/issues/1790)
* **webdriverio:** updated WebdriverIO to 8.13 ([b8916df](https://github.com/serenity-js/serenity-js/commit/b8916df65a18fd820578b1fd522f4e52119a79db))


### Features

* **core:** allow for easier debugging of Serenity/JS domain events using StreamReporter ([108677e](https://github.com/serenity-js/serenity-js/commit/108677e213423004127b6752301e73f66231030e)), closes [#1790](https://github.com/serenity-js/serenity-js/issues/1790)
* **webdriverio:** support for WebdriverIO 8.14 ([27c5cec](https://github.com/serenity-js/serenity-js/commit/27c5cec56be405bd729ab6b69170645e582248f1))





## [3.7.2](https://github.com/serenity-js/serenity-js/compare/v3.7.1...v3.7.2) (2023-07-26)


### Bug Fixes

* **core:** disabled emitting decorator meta-data ([a0b0425](https://github.com/serenity-js/serenity-js/commit/a0b04258faaa275325112b98a2fb340cd508c007))
* **deps:** update dependency fast-glob to ^3.3.1 ([0822973](https://github.com/serenity-js/serenity-js/commit/0822973cace7872cfa27e056c8c0276884ac8076))
* **deps:** update playwright dependencies to ^1.36.2 ([f9cc78f](https://github.com/serenity-js/serenity-js/commit/f9cc78fb75f431f92ef3788e9ed1e39d18039eac))
* **playwright-test:** simplified exported types, as per [@mxschmitt](https://github.com/mxschmitt) suggestion ([94874ba](https://github.com/serenity-js/serenity-js/commit/94874bae848713523b3513b91551097d6090351a)), closes [microsoft/playwright#24146](https://github.com/microsoft/playwright/issues/24146) [microsoft/TypeScript#5711](https://github.com/microsoft/TypeScript/issues/5711)





## [3.7.1](https://github.com/serenity-js/serenity-js/compare/v3.7.0...v3.7.1) (2023-07-22)


### Bug Fixes

* **serenity-bdd:** corrected downloading Serenity BDD jar using HTTP Proxy Agent ([48f79b9](https://github.com/serenity-js/serenity-js/commit/48f79b950b596e124afc415cab4a72279e50b367)), closes [#1795](https://github.com/serenity-js/serenity-js/issues/1795)





# [3.7.0](https://github.com/serenity-js/serenity-js/compare/v3.6.1...v3.7.0) (2023-07-20)


### Bug Fixes

* **core:** support for proxying String.replace in QuestionAdapter ([251113d](https://github.com/serenity-js/serenity-js/commit/251113d50002f2be175ca8e17466a8c5a8e9418d))
* **deps:** update playwright dependencies to ^1.36.1 ([b86289b](https://github.com/serenity-js/serenity-js/commit/b86289b3f6d703baa9867ad167502de102591545))


### Features

* **playwright:** support for parentElement.closestTo(childElement) API ([cee2c48](https://github.com/serenity-js/serenity-js/commit/cee2c48e63cc8edbfc9daece57e9966f8833beeb)), closes [#1784](https://github.com/serenity-js/serenity-js/issues/1784)
* **protractor:** support for parentElement.closestTo(childElement) API ([ec21e18](https://github.com/serenity-js/serenity-js/commit/ec21e18acf670cd090eb5b666e78d29b2943fd61))
* **webdriverio:** support for parentElement.closestTo(childElement) API ([ee1b3c4](https://github.com/serenity-js/serenity-js/commit/ee1b3c47180c384b2109cee3bac43ce7bfaff5e8))
* **web:** new PageElement Query Language API - parentElement.closestTo(childElement) ([7d48fd8](https://github.com/serenity-js/serenity-js/commit/7d48fd8c1dcda6cbd5f8d0579e4cce129b24618f))





## [3.6.1](https://github.com/serenity-js/serenity-js/compare/v3.6.0...v3.6.1) (2023-07-11)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.36.0 ([8b60383](https://github.com/serenity-js/serenity-js/commit/8b6038338b35d04072b166a9b66f63fa24af8dc0))
* **playwright-test:** ensure activity instantiation location is correct in component tests ([87d59ef](https://github.com/serenity-js/serenity-js/commit/87d59ef7549b12c071c09c103153599e86f74c90)), closes [#1784](https://github.com/serenity-js/serenity-js/issues/1784)





# [3.6.0](https://github.com/serenity-js/serenity-js/compare/v3.5.0...v3.6.0) (2023-07-11)


### Bug Fixes

* **deps:** update dependency https-proxy-agent to ^7.0.1 ([f49b293](https://github.com/serenity-js/serenity-js/commit/f49b2931ea3944854cd889a031f245b794b22566))
* **deps:** update dependency https-proxy-agent to ^7.0.1 ([9ea4610](https://github.com/serenity-js/serenity-js/commit/9ea4610563d7ce02ebfc42c5746671c5147cf745))
* **deps:** update dependency tiny-types to ^1.20.0 ([6d7bf43](https://github.com/serenity-js/serenity-js/commit/6d7bf43c6135968bc90869cb8f9782ed70ca8dd9))


### Features

* **playwright-test:** enable BrowseTheWebWithPlaywright to reuse an existing page instance ([5c2deb1](https://github.com/serenity-js/serenity-js/commit/5c2deb1853f27884fcdaccccc0b1b108c0a8489b)), closes [#1784](https://github.com/serenity-js/serenity-js/issues/1784)
* **playwright-test:** introducing Component Testing with Serenity/JS and Playwright Test ([7b3c6c8](https://github.com/serenity-js/serenity-js/commit/7b3c6c83d5caa48b4362dee0f30a154f00cb46e2)), closes [#1784](https://github.com/serenity-js/serenity-js/issues/1784)
* **web:** selectors are comparable and serialisable to JSON ([b285389](https://github.com/serenity-js/serenity-js/commit/b2853897e18a1a6693af156844830e8760d1a2b7)), closes [#1784](https://github.com/serenity-js/serenity-js/issues/1784)
* **web:** you can now use Serenity/JS Screenplay Pattern APIs for UI component testing ([3c9aa4b](https://github.com/serenity-js/serenity-js/commit/3c9aa4b16d223844116ffcb21d23f9cc8b96a793)), closes [#1784](https://github.com/serenity-js/serenity-js/issues/1784)





# [3.5.0](https://github.com/serenity-js/serenity-js/compare/v3.4.2...v3.5.0) (2023-07-02)


### Bug Fixes

* **core:** code clean-up: use type-only TypeScript imports where possible ([aa49150](https://github.com/serenity-js/serenity-js/commit/aa49150ca7f367363bb6fcc5e054da8bd820825e))
* **deps:** update dependency @giscus/react to v2.3.0 ([9146955](https://github.com/serenity-js/serenity-js/commit/91469559f2bb2e1147b23d7a79fc231e1be7ee93))


### Features

* **core:** actors can tell the current time ([c52959a](https://github.com/serenity-js/serenity-js/commit/c52959a877ee920955bdf45ce79fb2c2b5ac0148))





## [3.4.2](https://github.com/serenity-js/serenity-js/compare/v3.4.1...v3.4.2) (2023-06-30)


### Bug Fixes

* **deps:** update dependency fast-glob to ^3.3.0 ([bb00f5e](https://github.com/serenity-js/serenity-js/commit/bb00f5e0e916352bc5722064c0bcd97af4e38ab9))
* **playwright-test:** preserve Playwright Test-specific reporting when overriding actors ([8bf0bbb](https://github.com/serenity-js/serenity-js/commit/8bf0bbb86fd7f6d4f829ff943d3f970b9a960cc4))





## [3.4.1](https://github.com/serenity-js/serenity-js/compare/v3.4.0...v3.4.1) (2023-06-23)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.35.1 ([9124e2e](https://github.com/serenity-js/serenity-js/commit/9124e2e33a78ec1cd4c141abfad3f4874e5c3485))





# [3.4.0](https://github.com/serenity-js/serenity-js/compare/v3.3.1...v3.4.0) (2023-06-10)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.35.0 ([fb4359f](https://github.com/serenity-js/serenity-js/commit/fb4359f9a95f7ea4701590f71dab41ba4ed4fd02))
* **webdriverio:** support for WebdriverIO 8.11 APIs ([cebbeec](https://github.com/serenity-js/serenity-js/commit/cebbeecb1176b2d4bb4d3a1b4a2b48a46ea4b2be)), closes [#1739](https://github.com/serenity-js/serenity-js/issues/1739)


### Features

* **core:** compile Serenity/JS against ES2021 ([6b31184](https://github.com/serenity-js/serenity-js/commit/6b31184986f78b454ec1eeed53553fba8ebc868c))





## [3.3.1](https://github.com/serenity-js/serenity-js/compare/v3.3.0...v3.3.1) (2023-06-08)


### Bug Fixes

* **deps:** update dependency @paralleldrive/cuid2 to ^2.2.1 ([e01b642](https://github.com/serenity-js/serenity-js/commit/e01b6420142466f564898090b4fa80024ac572a5))
* **deps:** update dependency https-proxy-agent to v7 ([243e7de](https://github.com/serenity-js/serenity-js/commit/243e7de4315944a4af4887f1b1d137ffb3650676))
* **deps:** update dependency typedoc to ^0.24.8 ([4170d13](https://github.com/serenity-js/serenity-js/commit/4170d138de11dbbf828a96bf63109cca54fa0b24))





# [3.3.0](https://github.com/serenity-js/serenity-js/compare/v3.2.1...v3.3.0) (2023-06-01)


### Bug Fixes

* **core:** ability to ScheduleWork preserves stack traces for better reporting ([c2ce5f7](https://github.com/serenity-js/serenity-js/commit/c2ce5f768732de5b01113c0f2dfa8e98d3e73667)), closes [#1717](https://github.com/serenity-js/serenity-js/issues/1717)
* **deps:** update website dependencies to v2.4.1 ([6e4d17b](https://github.com/serenity-js/serenity-js/commit/6e4d17b046cf73441d1cac40d7f15a5bd393721a))
* **playwright-test:** corrected synchronisation of the `platform` fixture ([7156f84](https://github.com/serenity-js/serenity-js/commit/7156f840dc8fe5688d25aca5ba87d925158e9c7d)), closes [#1717](https://github.com/serenity-js/serenity-js/issues/1717)
* **playwright:** support for Playwright 1.34.0 ([5d591c7](https://github.com/serenity-js/serenity-js/commit/5d591c71e89ac4cfd41b8f7e3a1c9017f962d9e3))
* **playwright:** updated Playwright Core to 1.34.0 ([c5aa042](https://github.com/serenity-js/serenity-js/commit/c5aa042de25945c4fe4152eb06b2537c58a572e1))
* **playwright:** updated Playwright to 1.34.2 ([c944031](https://github.com/serenity-js/serenity-js/commit/c94403199a349d59bb777b981897039c102f243f))
* **playwright:** upgraded to Playwright 1.34.3 ([0ded19e](https://github.com/serenity-js/serenity-js/commit/0ded19e8ef3aea74307ab3bbd69ff5f7b3c9f78b))
* **protractor:** updated dependency on @types/selenium-webdriver ([a7a68ff](https://github.com/serenity-js/serenity-js/commit/a7a68ff05e822eb84b0cd62b112f3a951367ab4e))


### Features

* **core:** enabled extending default behaviour of actor.perform and actor.answer APIs ([01bb213](https://github.com/serenity-js/serenity-js/commit/01bb213fa59a03737cd7d0770cd5df737cffcb19)), closes [#1717](https://github.com/serenity-js/serenity-js/issues/1717)
* **playwright-test:** improved integration with Playwright Test ([45b324f](https://github.com/serenity-js/serenity-js/commit/45b324f4b2e2992dc2df78c18013f2f235ff91b9)), closes [#1717](https://github.com/serenity-js/serenity-js/issues/1717)
* **playwright-test:** much more detailed Playwright Test reports ([5980a1e](https://github.com/serenity-js/serenity-js/commit/5980a1e37047d71199cc169271fa11869e98355b)), closes [#1717](https://github.com/serenity-js/serenity-js/issues/1717)
* **playwright:** support Playwright auto-waiting ([8f1750f](https://github.com/serenity-js/serenity-js/commit/8f1750f5b086e09eacd514783d561b0a2abb2156)), closes [#1717](https://github.com/serenity-js/serenity-js/issues/1717)





## [3.2.1](https://github.com/serenity-js/serenity-js/compare/v3.2.0...v3.2.1) (2023-05-15)


### Bug Fixes

* **cucumber:** updated Cucumber to 9.1.2 ([e202cf8](https://github.com/serenity-js/serenity-js/commit/e202cf87b736b4d95613363e6b84c340d3e75f2c)), closes [#1690](https://github.com/serenity-js/serenity-js/issues/1690)
* **deps:** update dependency typedoc to ^0.24.7 ([d821a13](https://github.com/serenity-js/serenity-js/commit/d821a13002a0ed4d400ebf9d227ee0514b7b5332))
* **deps:** update serenity bdd dependencies ([4f39f2d](https://github.com/serenity-js/serenity-js/commit/4f39f2d7a0a7eedba2822dd08010ec77f0cb7984))





# [3.2.0](https://github.com/serenity-js/serenity-js/compare/v3.1.6...v3.2.0) (2023-05-05)


### Bug Fixes

* **core:** use "types" instead of "typings" in package.json files ([b83d922](https://github.com/serenity-js/serenity-js/commit/b83d922076242c6cd5d6f2da055a05aa5e77f11b)), closes [#1682](https://github.com/serenity-js/serenity-js/issues/1682)
* **deps:** update playwright dependencies to ^1.33.0 ([e1cebc4](https://github.com/serenity-js/serenity-js/commit/e1cebc434eba9242c4bba33268ab48b76c486c5f))
* **webdriverio:** aligned CJS and ESM exports to offer a consistent developer experience ([3f9f50a](https://github.com/serenity-js/serenity-js/commit/3f9f50a75afc13b63d3d3aa5ddd796011f9a009c))
* **webdriverio:** support for WebdriverIO 8.10.0 ([bf35d6c](https://github.com/serenity-js/serenity-js/commit/bf35d6ccee766523524e7267344acde2137d5bbc))


### Features

* **core:** introduced support for Node.js 20, dropped support for Node.js 14 ([d0f58a6](https://github.com/serenity-js/serenity-js/commit/d0f58a6ff1f03a4b7d9490af3c2ff33f2d1fef48)), closes [#1678](https://github.com/serenity-js/serenity-js/issues/1678)
* **core:** new factory method to create Path.fromURI ([baed8c4](https://github.com/serenity-js/serenity-js/commit/baed8c4a86a2d7b114783574c2326d8102c1b0e9))
* **webdriverio:** support for WebdriverIO 8 ([6275cb6](https://github.com/serenity-js/serenity-js/commit/6275cb693a3f9072468b196411a1b3fbd6e6ef27)), closes [#1541](https://github.com/serenity-js/serenity-js/issues/1541) [#1682](https://github.com/serenity-js/serenity-js/issues/1682) [webdriverio/webdriverio#10314](https://github.com/webdriverio/webdriverio/issues/10314)





## [3.1.6](https://github.com/serenity-js/serenity-js/compare/v3.1.5...v3.1.6) (2023-04-18)


### Bug Fixes

* **webdriverio:** upgraded to TypeScript 5 and WebdriverIO 7.31.1 ([15b1ba7](https://github.com/serenity-js/serenity-js/commit/15b1ba77e157d77123a2e8922414e937c0d2869d)), closes [#1558](https://github.com/serenity-js/serenity-js/issues/1558) [#1651](https://github.com/serenity-js/serenity-js/issues/1651)





## [3.1.5](https://github.com/serenity-js/serenity-js/compare/v3.1.4...v3.1.5) (2023-04-18)


### Bug Fixes

* **serenity-bdd:** improved support for nested requirement hierarchies with Cucumber.js ([749fb0f](https://github.com/serenity-js/serenity-js/commit/749fb0f9501575ac8152b01a980e4959a823471f)), closes [/github.com/serenity-bdd/serenity-core/blob/8f7d14c6dad47bb58a1585fef5f9d9a44bb963fd/serenity-model/src/main/java/net/thucydides/core/requirements/AbstractRequirementsTagProvider.java#L36](https://github.com//github.com/serenity-bdd/serenity-core/blob/8f7d14c6dad47bb58a1585fef5f9d9a44bb963fd/serenity-model/src/main/java/net/thucydides/core/requirements/AbstractRequirementsTagProvider.java/issues/L36) [#1649](https://github.com/serenity-js/serenity-js/issues/1649)
* **webdriverio:** webdriverio 7.31 breaks backwards-compatibility, pinning to 7.30 for now ([305fc64](https://github.com/serenity-js/serenity-js/commit/305fc648a8fdf96fdf5f26075845bfba6c61713c))





## [3.1.4](https://github.com/serenity-js/serenity-js/compare/v3.1.3...v3.1.4) (2023-04-16)


### Bug Fixes

* **serenity-bdd:** escape HTML tags in scenaio name and title ([c5ca1bf](https://github.com/serenity-js/serenity-js/commit/c5ca1bfcfcc297d913208246addf84d400608245)), closes [#1630](https://github.com/serenity-js/serenity-js/issues/1630)





## [3.1.3](https://github.com/serenity-js/serenity-js/compare/v3.1.2...v3.1.3) (2023-04-14)


### Bug Fixes

* **deps:** update dependency typedoc to ^0.24.1 ([c52f4ed](https://github.com/serenity-js/serenity-js/commit/c52f4ed078dc25fea2a3fa672e9690846659b81c))
* **playwright:** updated Playwright to 1.32.3 ([1d7f77b](https://github.com/serenity-js/serenity-js/commit/1d7f77bb0665ada8193b56598f31d3fb16c2384a))
* **protractor:** click interactions now scroll element into view before performing their action ([3ea7bb8](https://github.com/serenity-js/serenity-js/commit/3ea7bb8158302bfec0390dca6bc88060f0f291e9))





## [3.1.2](https://github.com/serenity-js/serenity-js/compare/v3.1.1...v3.1.2) (2023-04-07)


### Bug Fixes

* **protractor:** introduced an explicit dependency on @serenity-js/web ([a12271b](https://github.com/serenity-js/serenity-js/commit/a12271b9f3280bac7675ee653dd0a6fae8523aa9))
* **protractor:** moved @serenity-js/assertions to dev dependencies ([dd187d1](https://github.com/serenity-js/serenity-js/commit/dd187d100507e63675cc066c5da22834dcb35db1))





## [3.1.1](https://github.com/serenity-js/serenity-js/compare/v3.1.0...v3.1.1) (2023-04-05)


### Bug Fixes

* **core:** ensure Wait.for(..) is not terminated prematurely by interactionTimeout ([f1a94e2](https://github.com/serenity-js/serenity-js/commit/f1a94e259942725f2603cc33cd9772478e825dde)), closes [#1604](https://github.com/serenity-js/serenity-js/issues/1604)
* **deps:** update playwright dependencies to ^1.32.2 ([8398ec3](https://github.com/serenity-js/serenity-js/commit/8398ec364836f45af9e5734687e1655ca10a7784))
* **playwright-test:** use custom interactionTimeout when provided in the config ([71c0401](https://github.com/serenity-js/serenity-js/commit/71c0401539b722ad6858d9dcb6393593254c3787)), closes [#1604](https://github.com/serenity-js/serenity-js/issues/1604)
* **protractor:** use custom interactionTimeout when provided in the config ([df8f387](https://github.com/serenity-js/serenity-js/commit/df8f387d7f5b6a887f0f1b69881eec076d016147)), closes [#1604](https://github.com/serenity-js/serenity-js/issues/1604)
* **webdriverio:** use custom interactionTimeout when provided in the config ([4cc75bf](https://github.com/serenity-js/serenity-js/commit/4cc75bf1ef97556a991ad006314a1a413d3cde6a)), closes [#1604](https://github.com/serenity-js/serenity-js/issues/1604)





# [3.1.0](https://github.com/serenity-js/serenity-js/compare/v3.0.1...v3.1.0) (2023-04-02)


### Bug Fixes

* **core:** pinned dependencies on Serenity/JS modules ([b314b11](https://github.com/serenity-js/serenity-js/commit/b314b11a3755e490b307df0eca8369a9371b7bb8))
* **core:** replaced dependency on depracated cuid with cuid2 ([0417f1c](https://github.com/serenity-js/serenity-js/commit/0417f1c2c673dce7eaabe0ffae76311757e3b3ee))


### Features

* **cucumber:** support for Cucumber 9 ([ec7823e](https://github.com/serenity-js/serenity-js/commit/ec7823e384a47ae96a6006e52a58163020c0f851)), closes [#1431](https://github.com/serenity-js/serenity-js/issues/1431)





## [3.0.1](https://github.com/serenity-js/serenity-js/compare/v3.0.0...v3.0.1) (2023-03-25)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.32.1 ([1ab8b80](https://github.com/serenity-js/serenity-js/commit/1ab8b80487750cfe072cf113ecd13a3b40565f1f))
* **deps:** update playwright dependencies to ^1.32.1 ([bcb6839](https://github.com/serenity-js/serenity-js/commit/bcb68394317440d4b2ac567407c0c3539bd7ea38))
* **deps:** update playwright dependencies to ^1.32.1 ([3ba8d4c](https://github.com/serenity-js/serenity-js/commit/3ba8d4cdde99e48e5b74086d6ebf10630916f151))
* **deps:** update website dependencies to v2.4.0 ([9d4e427](https://github.com/serenity-js/serenity-js/commit/9d4e42713a776c43aa4f6dba369f6d059b8554c6))





# [3.0.0](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.45...v3.0.0) (2023-03-23)


### Features

* **core:** release Serenity/JS v3 ([0937dfa](https://github.com/serenity-js/serenity-js/commit/0937dfa23b8ef2da7210c64f2e25585c3430af78))





# [3.0.0-rc.45](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.44...v3.0.0-rc.45) (2023-03-22)


### Bug Fixes

* **core:** re-implemented the interaction to Debug so that it works in JetBrains IDEs ([14737f9](https://github.com/serenity-js/serenity-js/commit/14737f9eaa8cd1a66bce02649f768f4227bf1c27)), closes [#1520](https://github.com/serenity-js/serenity-js/issues/1520)
* **core:** removed deprecated API Cast.whereEveryoneCan ([7f2f5b9](https://github.com/serenity-js/serenity-js/commit/7f2f5b9e642a00b6ce6f66ec06dd32f7a248495e)), closes [#1403](https://github.com/serenity-js/serenity-js/issues/1403)
* **core:** removed deprecated API List.get ([6308686](https://github.com/serenity-js/serenity-js/commit/6308686cde3e908822265e53e68dd1df05aa2567)), closes [#1403](https://github.com/serenity-js/serenity-js/issues/1403)
* **core:** removed deprecated ContextTag ([d09a688](https://github.com/serenity-js/serenity-js/commit/d09a6888020f2a7f76c0830b6d2939205cf0b3aa)), closes [#1403](https://github.com/serenity-js/serenity-js/issues/1403)
* **deps:** update dependency deepmerge to ^4.3.1 ([d605a6b](https://github.com/serenity-js/serenity-js/commit/d605a6ba034b0d9d5d716c82ea496bd726a86348))
* **deps:** update dependency graceful-fs to ^4.2.11 ([3dc2d0b](https://github.com/serenity-js/serenity-js/commit/3dc2d0b30e474126c1427238e9440a9f942fbdd9))
* **deps:** update dependency typedoc to ^0.23.28 ([5d5b8d7](https://github.com/serenity-js/serenity-js/commit/5d5b8d706dc885d16c7cfeef96723cd744584c99))
* **local-server:** removed deprecated API StartLocalServer.onOneOfThePreferredPorts ([58cc29c](https://github.com/serenity-js/serenity-js/commit/58cc29cae1764e72d9c8e5d9ec26cfc8fe3fc0b7)), closes [#1403](https://github.com/serenity-js/serenity-js/issues/1403)
* **playwright:** it's now easier to inspect PlaywrightPage using the new interaction to Debug ([cbf210a](https://github.com/serenity-js/serenity-js/commit/cbf210a689c5e88b3856a337ecfe92031439a311))





# [3.0.0-rc.44](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.43...v3.0.0-rc.44) (2023-03-19)


### Bug Fixes

* **core:** moved time-related code to a common package ([f29fedc](https://github.com/serenity-js/serenity-js/commit/f29fedc0e67d0db942b247aed53a243868a5f6dd)), closes [#1522](https://github.com/serenity-js/serenity-js/issues/1522)
* **core:** support for NPM 9 ([0493474](https://github.com/serenity-js/serenity-js/commit/0493474a1e28b86b1b60f69ec0d591c1a3265425))
* **deps:** update dependency tiny-types to ^1.19.1 ([ce335eb](https://github.com/serenity-js/serenity-js/commit/ce335ebca434d1fd0e6e809a65a0882fd10a311a))
* **jasmine:** improved filesystem location detection for Jasmine scenarios ([ec180d6](https://github.com/serenity-js/serenity-js/commit/ec180d618d19e8a7f9d081c4f067329d252c72a3))
* **rest:** support for Axios 1.3.4 ([e926bbd](https://github.com/serenity-js/serenity-js/commit/e926bbde5232150f35e137601e321175d21d52d2))


### Features

* **assertions:** fault-tolerant interaction to Ensure.eventually ([d6297f7](https://github.com/serenity-js/serenity-js/commit/d6297f7f15c096a51461c484c6a8d1eeb2182b24)), closes [#1522](https://github.com/serenity-js/serenity-js/issues/1522)
* **core:** introduced a new ability ScheduleWork to enable [#1083](https://github.com/serenity-js/serenity-js/issues/1083) and [#1522](https://github.com/serenity-js/serenity-js/issues/1522) ([b275d18](https://github.com/serenity-js/serenity-js/commit/b275d18434cdedf069c5f1da3b9b359fc7da60fe))
* **core:** max timeout of Wait.until can now be configured globally ([8dd6895](https://github.com/serenity-js/serenity-js/commit/8dd68959c1c7c00ec7de0d4a18d6c9c0039c4a8e)), closes [#1083](https://github.com/serenity-js/serenity-js/issues/1083)





# [3.0.0-rc.43](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.42...v3.0.0-rc.43) (2023-03-10)


### Bug Fixes

* **core:** introduced Cast.where factory method to make it easier to generate custom casts of actors ([26637f1](https://github.com/serenity-js/serenity-js/commit/26637f10746bbd264ab73ab14b43eaf11dea5652)), closes [#1523](https://github.com/serenity-js/serenity-js/issues/1523)
* **deps:** update dependency deepmerge to ^4.3.0 ([ac08d09](https://github.com/serenity-js/serenity-js/commit/ac08d091eb61a666c9b9c53209b59fe7157c06d9))
* **deps:** update dependency yargs to ^17.7.1 ([1e7a52b](https://github.com/serenity-js/serenity-js/commit/1e7a52b21a778ebc47b6279786391d96e482b57a))
* **deps:** update playwright dependencies to ^1.31.2 ([ebac2ff](https://github.com/serenity-js/serenity-js/commit/ebac2ff37b7a922686daed0201d122f52b1d1040))
* **deps:** update website dependencies ([#1531](https://github.com/serenity-js/serenity-js/issues/1531)) ([4a58010](https://github.com/serenity-js/serenity-js/commit/4a58010759d5f3d00919dc5de315b46fa9fadd7f))
* **playwright-test:** ensure each new actor gets their own Playwright browser ([f4c527b](https://github.com/serenity-js/serenity-js/commit/f4c527b27446e32c31a230de3a4d29575ecc8c34)), closes [#1523](https://github.com/serenity-js/serenity-js/issues/1523)
* **protractor:** default actors receive abilities to BrowseTheWebWithProtractor and TakeNotes ([edcf734](https://github.com/serenity-js/serenity-js/commit/edcf73426827ad76427deb457786b163423aaf96)), closes [#1523](https://github.com/serenity-js/serenity-js/issues/1523)
* **webdriverio:** default actors receive abilities to BrowseTheWebWithWebdriverIO and TakeNotes ([3880d3b](https://github.com/serenity-js/serenity-js/commit/3880d3be3262dfa601f0ec31fa1518569b14b90b)), closes [#1523](https://github.com/serenity-js/serenity-js/issues/1523)





# [3.0.0-rc.42](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.41...v3.0.0-rc.42) (2023-02-12)


### Bug Fixes

* **console-reporter:** any post-test StageCrewMember errors will now get printed to terminal ([e4935df](https://github.com/serenity-js/serenity-js/commit/e4935dff73781076f4a5ec9fbf2821aaf9fbfd69)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)
* **core:** allow for multiple events to be announced using a single call to Stage ([2bcae80](https://github.com/serenity-js/serenity-js/commit/2bcae809075fd9ef4f77f41714c78a4da5643acd))
* **core:** event TestRunFinished now incidates the Outcome of the test suite ([a941056](https://github.com/serenity-js/serenity-js/commit/a9410566891e543101b935a80db9c7daea0c9944)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)
* **deps:** update website dependencies ([309c5f3](https://github.com/serenity-js/serenity-js/commit/309c5f3cac7517b9eb1fde5b22f3608c99c46000))
* **jasmine:** default to using file name as feature name when describe blocks are absent ([3542955](https://github.com/serenity-js/serenity-js/commit/3542955d7c0d3582283ecf1fe482cf3da93f9e4f)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)
* **mocha:** default to using file name as feature name when describe blocks are absent ([1ca81ef](https://github.com/serenity-js/serenity-js/commit/1ca81efe5fe5547bea3e4fd9abe7712f2e775b5d)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)
* **playwright-test:** default to using file name as feature name when describe blocks are absent ([1295b04](https://github.com/serenity-js/serenity-js/commit/1295b04adcd12a9d7eaef795e1080bb1c5a9056d)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)
* **serenity-bdd:** prevent invalid Serenity BDD JSON reports from being sent to processing ([e59d4da](https://github.com/serenity-js/serenity-js/commit/e59d4da0646c103db37631ecc33ecd66ae18d05e)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)





# [3.0.0-rc.41](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.40...v3.0.0-rc.41) (2023-02-07)


### Bug Fixes

* **assertions:** custom errors thrown via Ensure now include activity location ([1fdf7a2](https://github.com/serenity-js/serenity-js/commit/1fdf7a29aa4065d9ad23a750aa7c3cde6e36e2f1)), closes [#1102](https://github.com/serenity-js/serenity-js/issues/1102)
* **assertions:** interaction to Ensure no longer emits an AssertionReport artifact ([db3e5ae](https://github.com/serenity-js/serenity-js/commit/db3e5ae642f63ce808f52571f5ad840c614ef624)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **core:** corrected issue in asyncMap that led lists of lists to be flat-mapped not mapped ([d7a6f1d](https://github.com/serenity-js/serenity-js/commit/d7a6f1d7281f34c56cf2b606681c8046b1cffce7))
* **core:** easier configuration and automatic colour support detection for AnsiDiffFormatter ([637ed44](https://github.com/serenity-js/serenity-js/commit/637ed44ffb16484544ade975bcbc4c3929ffe8f9)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **core:** further improvements to how the expected vs received values are rendered in VS Code ([e2101d0](https://github.com/serenity-js/serenity-js/commit/e2101d0b11e56b1701bf75efe0d4f85ab72a6f48)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **core:** improved support for Node 14 ([f828b45](https://github.com/serenity-js/serenity-js/commit/f828b4563a3c5165dc066fc675d4e5c2b78c3a0a))
* **core:** introduced ExpectationDetails to provide more accurate info re failed expectations ([02b8f33](https://github.com/serenity-js/serenity-js/commit/02b8f33732341a9391192fc52a59ea8a8f5f19f0)), closes [#1102](https://github.com/serenity-js/serenity-js/issues/1102)
* **core:** removed AssertionReport and AssertionReportDiffer as they're no longer needed ([a968ac5](https://github.com/serenity-js/serenity-js/commit/a968ac57365e10b503e74db4319eb96b3430ffb0)), closes [#1480](https://github.com/serenity-js/serenity-js/issues/1480)
* **core:** removed the legacy Error (de-)serialisation mechanism ([7ea2b10](https://github.com/serenity-js/serenity-js/commit/7ea2b101c6d5ba1b32e14b3f24a5bd6b9c5c97f6))
* **core:** typeOf now correctly recognises Proxy objects ([3ca68a3](https://github.com/serenity-js/serenity-js/commit/3ca68a33524556c43d288a9131e79cb53a9f392e))
* **core:** updated npm-failsafe to 1.0.0 ([df80731](https://github.com/serenity-js/serenity-js/commit/df807312778e9722c893a9f410e51c1b15af01ac)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **playwright:** upgraded Playwright to 1.30.0 ([305a2c2](https://github.com/serenity-js/serenity-js/commit/305a2c258c06aa55685f99237cf3d3ce3c590122))
* **web:** renamed internal function `inspector` to `inspected` ([4d2b147](https://github.com/serenity-js/serenity-js/commit/4d2b14750ee2bfa3794cd0d5eba993689f1bc8b5))


### Features

* **assertions:** diffs included in RuntimeErrors are now colour-coded ([f88efb4](https://github.com/serenity-js/serenity-js/commit/f88efb48180924351e8f7b25c44f3560b0e01b0d)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **core:** assertion and synchronisation errors include location of the activity that threw them ([f06f378](https://github.com/serenity-js/serenity-js/commit/f06f378b9427d81a5adcea219ef01cf616a48c20)), closes [#1102](https://github.com/serenity-js/serenity-js/issues/1102)
* **core:** assertion errors include precise information about unmet expectations and improved diffs ([1eb09b1](https://github.com/serenity-js/serenity-js/commit/1eb09b1c1c8fb059b53bd7fcefab660581abc7bc)), closes [#1102](https://github.com/serenity-js/serenity-js/issues/1102)
* **core:** better assertion errors reporting in Visual Studio Code ([3b94b7d](https://github.com/serenity-js/serenity-js/commit/3b94b7d606fae49e7ca77c2fbe09d07eeb042ea9)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **core:** error factory is now configurable, which allows for the diffs to include colours ([dac293d](https://github.com/serenity-js/serenity-js/commit/dac293de5f8baed5aee3246b5467c4bcfbebbb25)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **core:** new ability to RaiseErrors ([4617d39](https://github.com/serenity-js/serenity-js/commit/4617d39a7b0d72381834abe27ff4393cbc79d0f5)), closes [#1102](https://github.com/serenity-js/serenity-js/issues/1102)
* **core:** overridable abilities ([03966cc](https://github.com/serenity-js/serenity-js/commit/03966ccae40d102b7dbca1125beb90ceda8fbc50))
* **protractor:** improved assertion error reporting for Protractor ([8f8f91c](https://github.com/serenity-js/serenity-js/commit/8f8f91c4364239b6637b35e371c31a69674b9e72)), closes [#1102](https://github.com/serenity-js/serenity-js/issues/1102)
* **webdriverio:** improved assertion error reporting for WebdriverIO ([7513752](https://github.com/serenity-js/serenity-js/commit/75137526c70d92869c87a127454c5b90a9948b87)), closes [#1102](https://github.com/serenity-js/serenity-js/issues/1102)





# [3.0.0-rc.40](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.39...v3.0.0-rc.40) (2023-01-06)


### Bug Fixes

* **playwright-test:** corrected invalid import path ([2c46662](https://github.com/serenity-js/serenity-js/commit/2c46662ba37cb43d0a487c265c087114d8dda518))





# [3.0.0-rc.39](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.38...v3.0.0-rc.39) (2023-01-05)


### Bug Fixes

* **core:** improved Duration to ensure it can't be instantiated with an invalid parameter ([9d89014](https://github.com/serenity-js/serenity-js/commit/9d89014a261659ef07ee05eb9082449019f21e50))
* **core:** improved error message shown when an actor doesn't have a required ability ([753b036](https://github.com/serenity-js/serenity-js/commit/753b0362ffbcc771995f711df89d1d64d4b55d76))
* **core:** simplified AsyncOperation events ([ac1a88f](https://github.com/serenity-js/serenity-js/commit/ac1a88f95560b5f163ac3f2302f4274f4bf99455))
* **core:** simplified internal AsyncOperation events to separate service name from task description ([0162d28](https://github.com/serenity-js/serenity-js/commit/0162d287c84a4ab716e5e655cfc2b816ba89f394))
* **deps:** update website dependencies ([#1437](https://github.com/serenity-js/serenity-js/issues/1437)) ([51ef285](https://github.com/serenity-js/serenity-js/commit/51ef2856a501d8d6c87e646ac8ec57464abd5836))
* **playwright-test:** better names for screenshots attached to Playwright Test reports ([8c04334](https://github.com/serenity-js/serenity-js/commit/8c043349165a090daf34fb1c363da47003130a53))
* **rest:** support for Axios 1.2.2 ([b6fa54b](https://github.com/serenity-js/serenity-js/commit/b6fa54b0d372bcf846d12bb60c91ac637015d1c6))


### Features

* **playwright-test:** annotate Playwright Test reports with Serenity/JS tags ([5e4a513](https://github.com/serenity-js/serenity-js/commit/5e4a513a5cd33cbff459148f365f90847c63518c))
* **playwright-test:** custom actors can now be defined in playwright config file ([117da34](https://github.com/serenity-js/serenity-js/commit/117da340c0a9bea214b2a3ea8182d803608697dc))
* **playwright-test:** interoperability between Serenity/JS default `actor` and `page` ([91803de](https://github.com/serenity-js/serenity-js/commit/91803de95c5bd1a8a475e5948e15cc49689a058c))
* **playwright-test:** support for Photographer and automated screenshots upon activity failure ([c5527ca](https://github.com/serenity-js/serenity-js/commit/c5527caee65cb89014ea9cb28b949cf45d7463a3))





# [3.0.0-rc.38](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.37...v3.0.0-rc.38) (2022-12-28)


### Bug Fixes

* **assertions:** improved AssertionError messages ([958ab7f](https://github.com/serenity-js/serenity-js/commit/958ab7f79daba8df25dbcff50d6a67b2bef58b29))
* **playwright:** introduced an explicit dependency on Playwright ([2136132](https://github.com/serenity-js/serenity-js/commit/2136132a95bfb4181c4854291cfeeacb876b9cfb))
* **serenity-bdd:** better error message when Java Runtime Environment is not detected ([47c00c3](https://github.com/serenity-js/serenity-js/commit/47c00c342c4d63034a433b96c91eba2ed1305544)), closes [#1455](https://github.com/serenity-js/serenity-js/issues/1455)





# [3.0.0-rc.37](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.36...v3.0.0-rc.37) (2022-12-18)


### Bug Fixes

* **deps:** update core dependencies to v5 ([7c44d5a](https://github.com/serenity-js/serenity-js/commit/7c44d5a6b498c034a5f55a4ae0b787f8ec2b5569))
* **deps:** update serenity bdd dependencies ([51af1fc](https://github.com/serenity-js/serenity-js/commit/51af1fc1b104cd3821e2e807b1cf8c90fdb3b418))
* **deps:** update website dependencies ([9be2176](https://github.com/serenity-js/serenity-js/commit/9be2176e66369d53647e81c82c0227d0cddfe2b6))
* **web:** support for setting cookies using async or partially async data ([ec8a65d](https://github.com/serenity-js/serenity-js/commit/ec8a65d9e3c1e2eb311d14eb32f1de9e26b5879b)), closes [#1421](https://github.com/serenity-js/serenity-js/issues/1421)


### Features

* **cucumber:** support reporting named hooks ([426f68d](https://github.com/serenity-js/serenity-js/commit/426f68ded6b9b10c08ee3ed5668754e1c6dac298)), closes [#1416](https://github.com/serenity-js/serenity-js/issues/1416)
* **playwright:** support for Playwright 1.29.0 ([3dd0635](https://github.com/serenity-js/serenity-js/commit/3dd0635d66df2571fb6d8d3e43d3feed71462da9))
* **rest:** support for Axios 1.2.1 ([b1ab268](https://github.com/serenity-js/serenity-js/commit/b1ab268319b6e165f051be8382cb5945ca6d1944))





# [3.0.0-rc.36](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.35...v3.0.0-rc.36) (2022-11-28)


### Bug Fixes

* **core:** reverted the change to List.get and marked method as deprecated, to be removed in 3.0 ([5ac8c69](https://github.com/serenity-js/serenity-js/commit/5ac8c69a5ddb2cbb62a76f5e25cfdeae11135b45)), closes [#1403](https://github.com/serenity-js/serenity-js/issues/1403)


### Features

* **cucumber:** support for Cucumber 8.9.0 ([67dcc71](https://github.com/serenity-js/serenity-js/commit/67dcc711549eee1d75d9cac1e4a3e4c7b4165080))





# [3.0.0-rc.35](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.34...v3.0.0-rc.35) (2022-11-25)


### Bug Fixes

* **core:** renamed List.get(index) to List.nth(index) to make the API declarative ([094e21c](https://github.com/serenity-js/serenity-js/commit/094e21ceb08e95ba5c9c5998cb5ecdfb13bdcf1b))
* **deps:** update dependency query-selector-shadow-dom to ^1.0.1 ([9e3bac6](https://github.com/serenity-js/serenity-js/commit/9e3bac6b13cfdbcd0ce001fbb363ff87ff3eedd3))
* **deps:** update website dependencies ([0ac28ff](https://github.com/serenity-js/serenity-js/commit/0ac28ff99c3ff16447b033f4e149b77d91fbef00))
* **playwright:** upgraded to Playwright 1.28.1 ([e9c4c1c](https://github.com/serenity-js/serenity-js/commit/e9c4c1c5c4467423c8254baeab0d0603d90c0d96))
* **webdriverio:** migrated to use Puppeteer 19.3 APIs ([1aa2ab7](https://github.com/serenity-js/serenity-js/commit/1aa2ab7495a7ddc7edf37f6d351ce26ccc7090c8))
* **web:** marked PageElement methods returning a MetaQuestion ([6f78186](https://github.com/serenity-js/serenity-js/commit/6f78186c8c11c603ec447f89007009ea75e80b89))


### BREAKING CHANGES

* **core:** List.get(index) replaced by List.nth(index); this affects classes inheriting from List, such as
PageElements





# [3.0.0-rc.34](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.33...v3.0.0-rc.34) (2022-11-21)


### Bug Fixes

* **core:** interaction to Wait should fail after the timeout ([5403394](https://github.com/serenity-js/serenity-js/commit/54033946873e20a18ad1076c77f841b3856f2478)), closes [#1339](https://github.com/serenity-js/serenity-js/issues/1339)





# [3.0.0-rc.33](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.32...v3.0.0-rc.33) (2022-11-07)


### Bug Fixes

* **core:** allow proxying `location` and `description` fields by `QuestionAdapter` ([6761685](https://github.com/serenity-js/serenity-js/commit/6761685d0cd0f775088d514c3eefbaff4431faa1)), closes [#1344](https://github.com/serenity-js/serenity-js/issues/1344)
* **deps:** update dependency fast-glob to ^3.2.12 ([94854a1](https://github.com/serenity-js/serenity-js/commit/94854a13881b46e11c908f7ff77a5940ac877f26))
* **jasmine:** remove warn jasmine#addSpecFiles ([9fef049](https://github.com/serenity-js/serenity-js/commit/9fef049f07c35992051b0cb27f023aa3b7ae2b9f))
* **playwright:** updated Playwright to 1.27.1 ([a1fcecc](https://github.com/serenity-js/serenity-js/commit/a1fcecc9d1cef1547f17cec5ed605d248060738f))
* **playwright:** upgraded Playwright to 1.27.1 ([1345644](https://github.com/serenity-js/serenity-js/commit/1345644dc6c0b4f09ca1f9cfe97a793e226e747c))





# [3.0.0-rc.32](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.31...v3.0.0-rc.32) (2022-10-12)


### Bug Fixes

* **core:** invocation location detection works for built-in interactions ([2ef0688](https://github.com/serenity-js/serenity-js/commit/2ef0688ada99cd372a2b2f9508b5d6b8e18b37f1))
* **cucumber:** refactored Cucumber event emitters to simplify the implementation ([b7a5d25](https://github.com/serenity-js/serenity-js/commit/b7a5d25a4cd37e00204064bb9c263b169be98a78))





# [3.0.0-rc.31](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.30...v3.0.0-rc.31) (2022-10-07)


### Bug Fixes

* **core:** corrected file system location reporting for built-in Interactions ([ce9acfc](https://github.com/serenity-js/serenity-js/commit/ce9acfc023442230a5060ff823d2198b92f72a30))
* **core:** improved invocation location detection on Windows ([#1332](https://github.com/serenity-js/serenity-js/issues/1332)) ([43dd9b9](https://github.com/serenity-js/serenity-js/commit/43dd9b95803b75cbcfce0eaa91ff272f33f7a60f))
* **deps:** update dependency cli-table3 to ^0.6.3 ([062b991](https://github.com/serenity-js/serenity-js/commit/062b99158b1c73d955fbcd0e9b538ecc72ee72fb))
* **playwright:** upgraded Playwright to 1.26.1 ([b056613](https://github.com/serenity-js/serenity-js/commit/b056613b2ab53807ff7af9b91229bde7d46879f3))
* **protractor:** standardised Web model APIs to always use async/await ([e8298dd](https://github.com/serenity-js/serenity-js/commit/e8298dd5e3c5da72695f356c225f7141039e0401))
* **webdriverio:** standardised Web model APIs to always use async/await ([8ea447f](https://github.com/serenity-js/serenity-js/commit/8ea447fdff8cc53ba3a2affef2c0a45ce6014a60))
* **web:** interaction to Clear.theValueOf(field) triggers compatible events for all web tools ([ee6c112](https://github.com/serenity-js/serenity-js/commit/ee6c112f0dbfd4fe78ee1a8793ef6be49be803f5)), closes [#1329](https://github.com/serenity-js/serenity-js/issues/1329)


### Features

* **web:** accept Answerable as argument of ExecuteScript.from(sourceUrl) ([0b06703](https://github.com/serenity-js/serenity-js/commit/0b06703cd832bf64dbb2636ef955ecba7b8b430c))





# [3.0.0-rc.30](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.29...v3.0.0-rc.30) (2022-10-05)


### Bug Fixes

* **core:** removed deprecated function `formatted` ([64d7f21](https://github.com/serenity-js/serenity-js/commit/64d7f21a1efc9bb1d13a7c5d086ffcdd208fe5d5)), closes [#1260](https://github.com/serenity-js/serenity-js/issues/1260)
* **deps:** update website dependencies ([f8e217b](https://github.com/serenity-js/serenity-js/commit/f8e217b3a1fd263280d9807d9eb9f45a45acc1b7))
* **web:** all web modules now correctly support handling iframe context for the current page ([bcb8672](https://github.com/serenity-js/serenity-js/commit/bcb86722dfcaa023613e63fb8bd2e14d6d546efd)), closes [#1310](https://github.com/serenity-js/serenity-js/issues/1310)
* **web:** corrected interaction to Clear to avoid issues with elements that have no value attribute ([37ae809](https://github.com/serenity-js/serenity-js/commit/37ae8092a36091db528024b99695905982ef8284)), closes [#1306](https://github.com/serenity-js/serenity-js/issues/1306)
* **web:** improve handling of closed windows on remote grids ([79d387d](https://github.com/serenity-js/serenity-js/commit/79d387d2d4a55367c3505f4c98f29f71a6a753f5)), closes [#1310](https://github.com/serenity-js/serenity-js/issues/1310)
* **web:** interaction to Clear now supports "contenteditable" elements ([d090458](https://github.com/serenity-js/serenity-js/commit/d090458845c23af59561d74421c16160ccc4ff64)), closes [#1306](https://github.com/serenity-js/serenity-js/issues/1306)


### Features

* **web:** interaction to Clear works with "contenteditable" elements across all the web tools ([c53b00d](https://github.com/serenity-js/serenity-js/commit/c53b00dac512977c00e5eadc101e281997f8e0de)), closes [#1306](https://github.com/serenity-js/serenity-js/issues/1306)





# [3.0.0-rc.29](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.28...v3.0.0-rc.29) (2022-10-01)


### Bug Fixes

* **serenity-bdd:** correct detection of invocation location for internal code ([c76ec76](https://github.com/serenity-js/serenity-js/commit/c76ec764ff7456c5059488a7d12c88990b4e43d8))





# [3.0.0-rc.28](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.27...v3.0.0-rc.28) (2022-09-30)


### Bug Fixes

* **console-reporter:** corrected default export so that it's detected as no-arg ([e39fc12](https://github.com/serenity-js/serenity-js/commit/e39fc123587badd9b906448d6d98beac99842f7d)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **console-reporter:** corrected error reporting when scenarios are executed in parallel ([170a31e](https://github.com/serenity-js/serenity-js/commit/170a31e799b7c1069ad6995387ea644612934c60)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** activity is now able to detect invocation location on Node 14 ([41f4776](https://github.com/serenity-js/serenity-js/commit/41f4776736620bc32d474d9b66f69c742f8eca96)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** enabled support for synthetic default imports and ES module interop ([3e63d07](https://github.com/serenity-js/serenity-js/commit/3e63d07d793cea169ebc4234ab096593f5aa9d97)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** improved implementation of EventQueue to better support parallel scenarios ([025e4fd](https://github.com/serenity-js/serenity-js/commit/025e4fdf962d6a7e31dde428a39a352983b1f2ab)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** simplified SceneFinishes event ([9ad947a](https://github.com/serenity-js/serenity-js/commit/9ad947adc49cefd9b64f48b02bc173f073f545c4)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** bulk-attach all Serenity/JS events to Playwright report ([a5f3d7c](https://github.com/serenity-js/serenity-js/commit/a5f3d7cfb8148cc80275a0736976726432b174f3)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** support for Playwright Test Babel loader ([f9a5412](https://github.com/serenity-js/serenity-js/commit/f9a54127bac921931a8ea115df47b4eb1dc6cc4a)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** wait for Photographer to finish taking screenshots before dismissing actors ([b0c5adb](https://github.com/serenity-js/serenity-js/commit/b0c5adba83fc92624e91c7385b38f0061cf5a6ed)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright:** corrected not(isPresent()) for PlaywrightPageElement ([0693b2f](https://github.com/serenity-js/serenity-js/commit/0693b2f2666a8de327c990c72ecf42fc3d7da498)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright:** upgraded Playwright to 1.25.2 ([fcbfdda](https://github.com/serenity-js/serenity-js/commit/fcbfddadce7afae714e11b22c732efd229d82128))
* **playwright:** upgraded Playwright to 1.26.0 ([a13ab3c](https://github.com/serenity-js/serenity-js/commit/a13ab3c54b37a5017beadf1db2b2cd2e747d8ab4))
* **rest:** removed deprecated ChangeApiUrl ([a8ab177](https://github.com/serenity-js/serenity-js/commit/a8ab17769329c6b6fd7648d4760f02790b255215)), closes [#1259](https://github.com/serenity-js/serenity-js/issues/1259)
* **web:** question about Text.of(element) now trims newline and space characters ([c68bbe9](https://github.com/serenity-js/serenity-js/commit/c68bbe9bed082c84538983dd6233e684190c3c43))


### Features

* **assertions:** new assertion about a property of an object ([9cc03d5](https://github.com/serenity-js/serenity-js/commit/9cc03d5c80c03d1969238e63018c6d5320c6a539))
* **console-reporter:** improved support for tests executed in parallel ([01264ce](https://github.com/serenity-js/serenity-js/commit/01264ce6110a3199265468f633eee5623fabe008)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **console-reporter:** report both total and real time it took to execute all the scenarios ([654be57](https://github.com/serenity-js/serenity-js/commit/654be57662d45560d79c341e21469ab7d703733b)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** serenity/JS stage crew members can now be configured using `string` ([786cdad](https://github.com/serenity-js/serenity-js/commit/786cdadcda8e031e06b8bee9698a87a7af00d90c)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240) [#594](https://github.com/serenity-js/serenity-js/issues/594)
* **playwright-test:** first draft of the Serenity/JS Playwright Test reporter ([b9e3d89](https://github.com/serenity-js/serenity-js/commit/b9e3d89752c07ef0fd54ad748c31fd7207665c3a)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** improved Playwright Test reports ([6c6b537](https://github.com/serenity-js/serenity-js/commit/6c6b5379dfc324a4fb75d758daa7782109f1c5ab)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** support Screenplay Pattern-style scenarios ([c425c54](https://github.com/serenity-js/serenity-js/commit/c425c548034de1b8db60e83671abcb77f9b246e5)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **serenity-bdd:** support for configuring SerenityBDDReporter using a ClassDescription string ([968e349](https://github.com/serenity-js/serenity-js/commit/968e349940d3ebe6d72dc94ca4db4b7e3a529b93)), closes [#594](https://github.com/serenity-js/serenity-js/issues/594)


### Reverts

* **web:** reverted the change to Text that would make it automatically trim the retrieved text ([f5a47b7](https://github.com/serenity-js/serenity-js/commit/f5a47b7e9e0be26522522b5a6647b24ffad6bee8))





# [3.0.0-rc.27](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.26...v3.0.0-rc.27) (2022-08-26)


### Bug Fixes

* **cucumber:** support for Cucumber 8.5.2 ([1e0763e](https://github.com/serenity-js/serenity-js/commit/1e0763edc803734dd3370dba45a5dc4ffef444f9))
* **deps:** update dependency diff to ^5.1.0 ([f21af46](https://github.com/serenity-js/serenity-js/commit/f21af465ac79ae8ebb9a6c0b701817027e81512f))
* **deps:** update dependency express to ^4.18.1 ([f10f264](https://github.com/serenity-js/serenity-js/commit/f10f264b7953f0453fcef89393d02adfbc3bfc8a))
* **deps:** update dependency moment to ^2.29.4 ([7b0fd6e](https://github.com/serenity-js/serenity-js/commit/7b0fd6eeda8bf8c24f61d0d103127740568abc1c))
* **deps:** update website dependencies ([#1278](https://github.com/serenity-js/serenity-js/issues/1278)) ([5e1de6d](https://github.com/serenity-js/serenity-js/commit/5e1de6df62632603fadbe942bbf8e1b7703a1780))
* **playwright:** support for Playwright 1.25.1 ([e0ab058](https://github.com/serenity-js/serenity-js/commit/e0ab0583493c05bd1ec31595f12356ab265b7c1a))





# [3.0.0-rc.26](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.25...v3.0.0-rc.26) (2022-08-15)


### Bug Fixes

* **local-server:** updated portfinder to 1.0.32 ([fed19e3](https://github.com/serenity-js/serenity-js/commit/fed19e3d04fc552270c3bfce70d9b164b1580fb5)), closes [http-party/node-portfinder#139](https://github.com/http-party/node-portfinder/issues/139)
* **webdriverio:** updated WebdriverIO dependencies to 7.20.9 ([da3ff9c](https://github.com/serenity-js/serenity-js/commit/da3ff9c4c55f59758450fc8428e0596f3d372ce6))





# [3.0.0-rc.25](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.24...v3.0.0-rc.25) (2022-08-15)


### Bug Fixes

* **core:** extracted common TypeScript configuration ([0108370](https://github.com/serenity-js/serenity-js/commit/0108370a6a7ebb4bcd71773482801d29f5660268))
* **core:** refactored the interaction to Wait.until to improve its reliability ([970ea39](https://github.com/serenity-js/serenity-js/commit/970ea396d4b34169480b34258624cd5b886aac37)), closes [#1255](https://github.com/serenity-js/serenity-js/issues/1255)
* **deps:** updated TinyTypes to 1.19.0 ([f6d53e4](https://github.com/serenity-js/serenity-js/commit/f6d53e4dbbfcb81139bd888ac11441b6344e47f5))
* **local-server:** pinned portfinder to 1.0.28 ([16369a9](https://github.com/serenity-js/serenity-js/commit/16369a9e94c2672a14840cbe74acb3bb27686204)), closes [http-party/node-portfinder#138](https://github.com/http-party/node-portfinder/issues/138)
* **playwright:** corrected internal imports from playwright to playwright-core ([c42e7f3](https://github.com/serenity-js/serenity-js/commit/c42e7f306096747e771ba6b83ce10159c2f043ac))
* **playwright:** updated Playwright ([3fa7c7e](https://github.com/serenity-js/serenity-js/commit/3fa7c7e03674c3aa71e3d1edd40ec855c1a0cde1))
* **playwright:** updated Playwright to 1.24.2 ([9283910](https://github.com/serenity-js/serenity-js/commit/9283910ff6fc8edc2926b2544e0e068202505e06))
* **webdriverio:** ensure Serenity/JS-specific config is not passed to WebdriverIO-specific services ([384738e](https://github.com/serenity-js/serenity-js/commit/384738e0d7b61b69de24b11ff1fbc32b835a440c))
* **webdriverio:** use local instead of global browser object in WebdriverioPage ([323be75](https://github.com/serenity-js/serenity-js/commit/323be7517ea8b90f967f510c03c744330c5ba2b0))
* **web:** simplified isClickable so that it doesn't include visibility check ([33ad47e](https://github.com/serenity-js/serenity-js/commit/33ad47e448e73a26f337371fcc6f5566845b4c93))


### Features

* **core:** support for registering custom RuntimeErrors with ErrorSerialiser ([feed78c](https://github.com/serenity-js/serenity-js/commit/feed78c6a5ed3c0ae3c614df69b29dbd4337d524))





# [3.0.0-rc.24](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.23...v3.0.0-rc.24) (2022-07-23)


### Bug Fixes

* **core:** improved how the interaction to Log reports names of the logged values ([c4cc60d](https://github.com/serenity-js/serenity-js/commit/c4cc60d0e1d4bdc34218566b1726e74d3ac40909))
* **cucumber:** updated @cucumber/messages ([9d970d0](https://github.com/serenity-js/serenity-js/commit/9d970d0bafb591ac2a901e6b56318b9c937c868c))
* **playwright:** upgraded Playwright to 1.24.0 ([9f8d491](https://github.com/serenity-js/serenity-js/commit/9f8d491cefd893ed7730c55f4186e4b3ffcc0e1d))
* **web:** simplified the implementation of isClickable and isEnabled ([142eb86](https://github.com/serenity-js/serenity-js/commit/142eb861d95e08df7717e9fffc57153a62c88f66)), closes [#1255](https://github.com/serenity-js/serenity-js/issues/1255)


### Features

* **core:** new interaction to Debug.values(..) and Debug.setBreakpoint() ([ef54324](https://github.com/serenity-js/serenity-js/commit/ef54324ca1b415d41eee12e7f4667cbffe2c8a01))
* **cucumber:** support for Cucumber v8 ([e0029e2](https://github.com/serenity-js/serenity-js/commit/e0029e22f94ef73e84530ff881567db87691dd81)), closes [#1216](https://github.com/serenity-js/serenity-js/issues/1216)
* **web:** PageElement-releated expectations now also check if the element is present ([de4610c](https://github.com/serenity-js/serenity-js/commit/de4610c3199f7130fd56d2d6799a328cbd7540a2)), closes [#1255](https://github.com/serenity-js/serenity-js/issues/1255)





# [3.0.0-rc.23](https://github.com/serenity-js/serenity-js/compare/v2.33.10...v3.0.0-rc.23) (2022-07-19)


### Bug Fixes

* **node:** support for Node 18 ([73212bc](https://github.com/serenity-js/serenity-js/commit/73212bc9deb1998d871b0720a6b437687b3ceddc)), closes [#1243](https://github.com/serenity-js/serenity-js/issues/1243)



# [3.0.0-rc.22](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.21...v3.0.0-rc.22) (2022-07-15)


### Bug Fixes

* **core:** ensure all async operations complete before attempting to dismiss the actors ([635cd9a](https://github.com/serenity-js/serenity-js/commit/635cd9a07481a97017506577e24e92e32a02e0e9)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **core:** further improvements to stage/actor synchronisation ([1e2e6fb](https://github.com/serenity-js/serenity-js/commit/1e2e6fb5c4ac727d209e1c45d466d0485f4cf548))
* **web:** improved reliability of PageElementLocator for WebdriverIO and Protractor ([b19d19a](https://github.com/serenity-js/serenity-js/commit/b19d19aedc0d60d4068191e7eb83943b9268e39a)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)


### Features

* **assertions:** isCloseTo(expected, tolerance) ([bb0e935](https://github.com/serenity-js/serenity-js/commit/bb0e935e197b195da598ccbec6c6cf7704dd875b))



# [3.0.0-rc.21](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.20...v3.0.0-rc.21) (2022-07-11)


### Bug Fixes

* **web:** corrected promise handling to avoid the unhandled promise rejection warning ([daac705](https://github.com/serenity-js/serenity-js/commit/daac705174683425109591e25139b5172fbdd7d3))



# [3.0.0-rc.20](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.19...v3.0.0-rc.20) (2022-07-11)


### Bug Fixes

* **core:** corrected Wait so that polling stops when the timeout expires ([60677e7](https://github.com/serenity-js/serenity-js/commit/60677e700269f03fd08e2cd58c06df0ec9c71f6f))
* **protractor:** isVisible check for ProtractorPageElement returns false for non-existent elements ([e64eee3](https://github.com/serenity-js/serenity-js/commit/e64eee377af32909f25e7c1d88f45a484abb1514)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **webdriverio:** improved resiliency of the WebdriverIOPuppeteerModalDialogHandler ([5e56edf](https://github.com/serenity-js/serenity-js/commit/5e56edf875a6d21cabbe02505179e98d05bc89b7)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **webdriverio:** updated WebdriverIO dependencies ([0833a3c](https://github.com/serenity-js/serenity-js/commit/0833a3cb804bf800645c564877277c8498412ef2))
* **web:** improved JavaScript dialog-related error handling when taking screenshots ([3cd1149](https://github.com/serenity-js/serenity-js/commit/3cd1149ed74df95da17f1054cd4da93b095a4eed)), closes [puppeteer/puppeteer#2481](https://github.com/puppeteer/puppeteer/issues/2481) [#1156](https://github.com/serenity-js/serenity-js/issues/1156)
* **web:** removed dependency on is-plain-object ([cbe76a6](https://github.com/serenity-js/serenity-js/commit/cbe76a6e36f3ccc4a012e81244aa108a040b2d45))
* **web:** renamed PagesContext to BrowsingSession to make the name more descriptive ([6b4e998](https://github.com/serenity-js/serenity-js/commit/6b4e9984d80f8f349f367e59bd0e615cd01703ec)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)


### Features

* **core:** interaction to Wait stops upon errors ([56ff3eb](https://github.com/serenity-js/serenity-js/commit/56ff3ebd5366064f89be8ad3eefa53114ad12e85)), closes [#1035](https://github.com/serenity-js/serenity-js/issues/1035)
* **core:** interactions to Wait.for and Wait.until are now browser-independent ([d115142](https://github.com/serenity-js/serenity-js/commit/d1151427bed96c1ebd0d1dcc4159c6aeedc605de)), closes [#1035](https://github.com/serenity-js/serenity-js/issues/1035) [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **core:** minimum timeout and polling interval guards for Wait ([fd53d81](https://github.com/serenity-js/serenity-js/commit/fd53d81f5211eca18ba91729088d07883f2f9956)), closes [#1035](https://github.com/serenity-js/serenity-js/issues/1035)
* **playwright:** configurable navigation and interaction timeouts for BrowseTheWebWithPlaywright ([142b78e](https://github.com/serenity-js/serenity-js/commit/142b78ed5c3ede1f61f5a1c5ae72d785c3fe70a9)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **playwright:** configurable navigation waitUntil timeout ([2458fcb](https://github.com/serenity-js/serenity-js/commit/2458fcb22c946da41ab59cb21ac0d4cc48012da7)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **playwright:** initial support for Playwright ([87e88a1](https://github.com/serenity-js/serenity-js/commit/87e88a16cdc06477ed25eb83f9597fd370fdc109)), closes [#493](https://github.com/serenity-js/serenity-js/issues/493) [#563](https://github.com/serenity-js/serenity-js/issues/563) [#911](https://github.com/serenity-js/serenity-js/issues/911)
* **playwright:** interaction to Select option(s) from a <select /> dropdown ([009041d](https://github.com/serenity-js/serenity-js/commit/009041d83e22ddf3fef14670e0e5fd6d11cdfc73)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **playwright:** interactions to Scroll, Press, and TakeScreenshot ([1c039d2](https://github.com/serenity-js/serenity-js/commit/1c039d2027057f074f3d9be9685489b1512ac63c)), closes [#493](https://github.com/serenity-js/serenity-js/issues/493) [#563](https://github.com/serenity-js/serenity-js/issues/563) [#911](https://github.com/serenity-js/serenity-js/issues/911)
* **playwright:** isActive check for PlaywrightPageElement ([dbf44eb](https://github.com/serenity-js/serenity-js/commit/dbf44eb7a8bfbeb45e03d9269d8c454e951c11b2)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **playwright:** support for executing in-browser JavaScript ([630bedd](https://github.com/serenity-js/serenity-js/commit/630beddbf6f782a85e1a15c0b8b57637498dbd91)), closes [#493](https://github.com/serenity-js/serenity-js/issues/493) [#563](https://github.com/serenity-js/serenity-js/issues/563) [#911](https://github.com/serenity-js/serenity-js/issues/911)
* **playwright:** support for isClickable ([afc8587](https://github.com/serenity-js/serenity-js/commit/afc8587a2ee2af6a4151512dc621473a3a892b7e)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **playwright:** support for isVisible, plus consistent visibility checks across the board ([2c5c929](https://github.com/serenity-js/serenity-js/commit/2c5c929802f894f9fe59438a01f08b1b7bec3318)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **playwright:** support for working with cookies ([1215a8f](https://github.com/serenity-js/serenity-js/commit/1215a8f0d2aabd99bdda8be4e136e0c4f6687803)), closes [#1237](https://github.com/serenity-js/serenity-js/issues/1237)
* **playwright:** support for working with frames ([89d4621](https://github.com/serenity-js/serenity-js/commit/89d46212073a342fe812a3ad2638a2ad0c39b620)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **web:** introduced PagesContext and implemented PlaywrightPage ([0045a72](https://github.com/serenity-js/serenity-js/commit/0045a726d540871333f644928218aed00bcd372c)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **web:** new portable APIs to handle ModalDialog windows ([c94d0ec](https://github.com/serenity-js/serenity-js/commit/c94d0ec43d2bc8aa39f8824f5d0f1e1cbcf137a1)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236) [#805](https://github.com/serenity-js/serenity-js/issues/805) [#1156](https://github.com/serenity-js/serenity-js/issues/1156)
* **web:** standardised support for deep CSS selectors across the Web integration modules ([e9e3f28](https://github.com/serenity-js/serenity-js/commit/e9e3f281191fc5c891841b6c8aab41213da3b0f5)), closes [#1238](https://github.com/serenity-js/serenity-js/issues/1238)



# [3.0.0-rc.19](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.18...v3.0.0-rc.19) (2022-06-11)


### Bug Fixes

* **deps:** upgraded "error-stack-parser" to 2.1.4 and removed dependency on "stackframe" ([8d44563](https://github.com/serenity-js/serenity-js/commit/8d445631c015887a608c3a62079d47bbec22794c)), closes [stacktracejs/error-stack-parser#75](https://github.com/stacktracejs/error-stack-parser/issues/75) [stacktracejs/error-stack-parser#80](https://github.com/stacktracejs/error-stack-parser/issues/80)
* **rest:** updated Axios to 0.27.2 ([b54694b](https://github.com/serenity-js/serenity-js/commit/b54694ba3dd2b8e0316d94c44381f51b1ab79ad0)), closes [axios/axios#4124](https://github.com/axios/axios/issues/4124) [#1223](https://github.com/serenity-js/serenity-js/issues/1223)


### Features

* **core:** Question.fromObject() generates questions from plain objects with nested Answerables ([3113f20](https://github.com/serenity-js/serenity-js/commit/3113f20ed5c86cb4bcf11479855d4ceaa5696970)), closes [#1219](https://github.com/serenity-js/serenity-js/issues/1219)



# [3.0.0-rc.18](https://github.com/serenity-js/serenity-js/compare/v2.33.9...v3.0.0-rc.18) (2022-06-06)


### Bug Fixes

* **deps:** updated error-stack-parser to 2.1.0 ([e57957b](https://github.com/serenity-js/serenity-js/commit/e57957b7739cd84c35b125552a78586cb2d4f2bf)), closes [stacktracejs/error-stack-parser#75](https://github.com/stacktracejs/error-stack-parser/issues/75)
* **deps:** updated tiny-types ([f1951cf](https://github.com/serenity-js/serenity-js/commit/f1951cf753df3807b5778d116f8e8bc3f24830a7))
* **deps:** updated tiny-types to 1.18.2 ([83a651c](https://github.com/serenity-js/serenity-js/commit/83a651c4c2f3f8dbaabcdacba94c720efdff45dd))


### Features

* **core:** further improvements to Notepad ([c0d4c0a](https://github.com/serenity-js/serenity-js/commit/c0d4c0a8cdbc38274d2b27f48337742be3322b12)), closes [#1220](https://github.com/serenity-js/serenity-js/issues/1220)



# [3.0.0-rc.17](https://github.com/serenity-js/serenity-js/compare/v2.33.8...v3.0.0-rc.17) (2022-06-02)


### Bug Fixes

* **core:** corrected QuestionAdapter to improve support for `any` type ([9bed585](https://github.com/serenity-js/serenity-js/commit/9bed5851a342c77052d378e6178765d65e542be8))


### Features

* **core:** Screenplay-style Dictionary<T> to help resolve objects with nested Questions ([6a66778](https://github.com/serenity-js/serenity-js/commit/6a667788b7579f94edb70c36103d82ca3f146eed)), closes [#1219](https://github.com/serenity-js/serenity-js/issues/1219)
* **core:** type-safe Notepad and improved notes() DSL with support for QuestionAdapters ([04c5397](https://github.com/serenity-js/serenity-js/commit/04c53971cc90561f07fa64eaed79777a90f75d5a)), closes [#1220](https://github.com/serenity-js/serenity-js/issues/1220)
* **rest:** all HTTP requests accept DynamicRecord<AxiosRequestConfig> ([c28b47c](https://github.com/serenity-js/serenity-js/commit/c28b47cde53e2e0d3ee8313a1e21e15cbe78df9a)), closes [#463](https://github.com/serenity-js/serenity-js/issues/463)



# [3.0.0-rc.16](https://github.com/serenity-js/serenity-js/compare/v2.33.6...v3.0.0-rc.16) (2022-04-15)


### Features

* **core:** get the number of notes stored in the notepad with Notepad#size() ([a5c00b9](https://github.com/serenity-js/serenity-js/commit/a5c00b9b5cef455ec1410039137e5c79aa9d9460))
* **core:** improved support for recording and reading notes ([6afc610](https://github.com/serenity-js/serenity-js/commit/6afc6104d808866dbcabe92bbd64eb97fa104f7a)), closes [#817](https://github.com/serenity-js/serenity-js/issues/817)


### BREAKING CHANGES

* **core:** This implementation replaces the previous implementations of TakeNote, TakeNotes
and Note, so tests using those interfaces will need to be updated.



# [3.0.0-rc.15](https://github.com/serenity-js/serenity-js/compare/v2.33.5...v3.0.0-rc.15) (2022-04-10)


### Bug Fixes

* **web:** corrected an inefficient regular expression in By selector description generator ([1b537d2](https://github.com/serenity-js/serenity-js/commit/1b537d2de02f89760237816fc726f5e11c2bee0c))
* **web:** replaced legacy PromiseLike return types with native Promise types ([436b3cb](https://github.com/serenity-js/serenity-js/commit/436b3cba1793f63008a56633cc93669736155ce6))



# [3.0.0-rc.14](https://github.com/serenity-js/serenity-js/compare/v2.33.3...v3.0.0-rc.14) (2022-03-28)


### Bug Fixes

* **web:** auto-generated descriptions of nested PageElements are easier to read ([5a51d91](https://github.com/serenity-js/serenity-js/commit/5a51d91f0abb1c32814c219a44da51d52df77f87))
* **web:** corrected return types of question about Selected page elements ([b32f280](https://github.com/serenity-js/serenity-js/commit/b32f2809b018d6791a37fd80a226ca16a822b9b6))


### Features

* **web:** Attribute.called(name).of(pageElement) returns a QuestionAdapter ([e220665](https://github.com/serenity-js/serenity-js/commit/e220665de37f15d4cfc8ad570bfa7b804d71335b))
* **web:** CssClasses.of(pageElement) returns a QuestionAdapter ([0942887](https://github.com/serenity-js/serenity-js/commit/0942887eb8e726dce3b8d64a7f9162ec782e61b7))
* **web:** Value.of(pageElement) returns a QuestionAdapter ([c45b483](https://github.com/serenity-js/serenity-js/commit/c45b483be071d297dc41e6b098a03f5697d53050))



# [3.0.0-rc.13](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.12...v3.0.0-rc.13) (2022-03-02)


### Features

* **web:** combined Frame and PageElement so they can be Switch-ed to ([1b7ab7c](https://github.com/serenity-js/serenity-js/commit/1b7ab7c828034a14ba801cbfa97acc203fd55adf)), closes [#82](https://github.com/serenity-js/serenity-js/issues/82) [#227](https://github.com/serenity-js/serenity-js/issues/227) [#233](https://github.com/serenity-js/serenity-js/issues/233) [#365](https://github.com/serenity-js/serenity-js/issues/365)



# [3.0.0-rc.12](https://github.com/serenity-js/serenity-js/compare/v2.33.2...v3.0.0-rc.12) (2022-02-23)


### Bug Fixes

* **serenity-bdd:** downgraded to Serenity BDD CLI 3.1.0 ([773786a](https://github.com/serenity-js/serenity-js/commit/773786af91f0aaab5a6deeba8b327fda0f5cfb9f)), closes [#1133](https://github.com/serenity-js/serenity-js/issues/1133)



# [3.0.0-rc.11](https://github.com/serenity-js/serenity-js/compare/v2.33.1...v3.0.0-rc.11) (2022-02-13)


### Bug Fixes

* **core:** updated dependency on error-stack-parser ([ea50285](https://github.com/serenity-js/serenity-js/commit/ea502855da40c2f95c893c75061ef6dcf12f669d))
* **web:** made the constructor of BrowseTheWeb protected, since it's an abstract class ([dbfbed0](https://github.com/serenity-js/serenity-js/commit/dbfbed02923bc1c589e588429c163ffbc7b13a34))


### Features

* **serenity-bdd:** updated Serenity BDD CLI to 3.2.0, which introduces new HTML reports ([9abdbd6](https://github.com/serenity-js/serenity-js/commit/9abdbd66721585af3f16d5def78e0484b9a08a92))
* **web:** support for working with frames and an interaction to Switch.to(frameOrPage) ([ef73ef2](https://github.com/serenity-js/serenity-js/commit/ef73ef273f8a17e48d396d5ef03f6b761b136c9a)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)



# [3.0.0-rc.10](https://github.com/serenity-js/serenity-js/compare/v2.33.0...v3.0.0-rc.10) (2022-02-03)



# [3.0.0-rc.9](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.8...v3.0.0-rc.9) (2022-02-01)


### Features

* **web:** isVisible() works with Web elements in Shadow DOM ([cf84fb0](https://github.com/serenity-js/serenity-js/commit/cf84fb072a6b813338b68bb1dec3932ea8709e3e)), closes [#1085](https://github.com/serenity-js/serenity-js/issues/1085)



# [3.0.0-rc.8](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.7...v3.0.0-rc.8) (2022-01-28)


### Bug Fixes

* **core:** ensure Question.about doesn't expose internal interfaces ([4bfb6bc](https://github.com/serenity-js/serenity-js/commit/4bfb6bca6af81d23ced551f63df5bc9f35d581df)), closes [#1106](https://github.com/serenity-js/serenity-js/issues/1106)
* **webdriverio:** corrected visibility of the `browser` field on BrowseTheWebWithWebdriverIO ([0de725f](https://github.com/serenity-js/serenity-js/commit/0de725f71ec67c496b16fabdbc7e1a06715732fa))



# [3.0.0-rc.7](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.6...v3.0.0-rc.7) (2022-01-28)


### Bug Fixes

* **core:** removed deprecated interface DressingRoom; please use Cast instead ([d68b44b](https://github.com/serenity-js/serenity-js/commit/d68b44b545f50f6533523ab07008f9f89ac34433))
* **core:** removed deprecated interface WithStage ([45d1c2b](https://github.com/serenity-js/serenity-js/commit/45d1c2b3e0ff1946ccff97d148d0776f2fa60065))
* **core:** removed deprecated task to See.if ([dd5e2f5](https://github.com/serenity-js/serenity-js/commit/dd5e2f5c7e61444d40899f70d413f38bc9f6691a))
* **cucumber:** SECURITY: removed overrides for colors.js since the issue has now been addressed ([481e327](https://github.com/serenity-js/serenity-js/commit/481e327cbe4e1655eac62d22b12807445f21ae1f)), closes [cucumber/cucumber-js#1885](https://github.com/cucumber/cucumber-js/issues/1885)


### Features

* **assertions:** isPresent works with any Optional ([cea75dc](https://github.com/serenity-js/serenity-js/commit/cea75dc1c728e45e06a87aaf9c1573a237334285)), closes [#1103](https://github.com/serenity-js/serenity-js/issues/1103)
* **core:** `f` and `d` question description formatters ([c9f3fad](https://github.com/serenity-js/serenity-js/commit/c9f3fadd86ec0196f2cdbf76d9628bbef0a3fcba))
* **core:** replaced `Adapter` with `QuestionAdapter` and introduced `Optional` ([8d84ad3](https://github.com/serenity-js/serenity-js/commit/8d84ad3863e3c726533d0f21934fb1e2fa8b3022)), closes [#1103](https://github.com/serenity-js/serenity-js/issues/1103)
* **core:** support for Optional chaining, expectation isPresent, refactored Expectations ([1841ee5](https://github.com/serenity-js/serenity-js/commit/1841ee5fc48cfa403ddc53358f75764d9a010c21)), closes [#1099](https://github.com/serenity-js/serenity-js/issues/1099) [#1099](https://github.com/serenity-js/serenity-js/issues/1099) [#1103](https://github.com/serenity-js/serenity-js/issues/1103)



# [3.0.0-rc.6](https://github.com/serenity-js/serenity-js/compare/v2.32.7...v3.0.0-rc.6) (2022-01-10)



# [3.0.0-rc.5](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.4...v3.0.0-rc.5) (2022-01-07)


### Bug Fixes

* **core:** screenplay Adapters will now correctly proxy calls to function-specific object keys ([ad6f1e6](https://github.com/serenity-js/serenity-js/commit/ad6f1e655ca77d6efde4461854e54c4113ca8fdd))
* **jasmine:** integrated with Jasmine 3.99.0 ([7f03bb5](https://github.com/serenity-js/serenity-js/commit/7f03bb56d4dc50209b01bdd0ed147eb7da7cfb93))


### Features

* **web:** support for advanced PageElement locator patterns ([c1ff8b7](https://github.com/serenity-js/serenity-js/commit/c1ff8b7539ebc1da8f79ea2b6d17bb01c42f443d)), closes [#1084](https://github.com/serenity-js/serenity-js/issues/1084)



# [3.0.0-rc.4](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.3...v3.0.0-rc.4) (2021-12-30)


### Bug Fixes

* **core:** you can now retrieve the .length property of an Array wrapped in an Adapter<Array> ([c36e210](https://github.com/serenity-js/serenity-js/commit/c36e210c024052b96ba47e9663c7098e269c5688))


### Features

* **web:** ElementExpectation makes it easier to define custom PageElement-related Expectations ([92ebf7d](https://github.com/serenity-js/serenity-js/commit/92ebf7db720d0fe88ddbe17b9958fa993b1fd02e))
* **web:** Text.ofAll accepts mapped PageElements ([5314246](https://github.com/serenity-js/serenity-js/commit/5314246305fa3f62446d5ec718f36354152be68d))



# [3.0.0-rc.3](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.2...v3.0.0-rc.3) (2021-12-29)


### Bug Fixes

* **core:** refactored Mappable so that it's easier to implement filters ([176e0cd](https://github.com/serenity-js/serenity-js/commit/176e0cd0303d63271477b2b7a8e7b0572dda99a0)), closes [#1074](https://github.com/serenity-js/serenity-js/issues/1074)
* **core:** removed interface Reducible since it's not used any more ([1e9f23b](https://github.com/serenity-js/serenity-js/commit/1e9f23b227e3c4509dd52d6885cde5d3ecd1d102))
* **deps:** updated tiny-types to 1.17.0 ([3187051](https://github.com/serenity-js/serenity-js/commit/3187051594158b4b450c82e851e417fd2ed21652))
* **examples:** updated the examples to use the new PageElement, By, and .where APIs ([54961a7](https://github.com/serenity-js/serenity-js/commit/54961a7a3af06716295a1cab56a9c0e10d5dac73)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **rest:** corrected LastResponse to wrap .status(), .body(), .header() and .headers() in Adapters ([aab8e93](https://github.com/serenity-js/serenity-js/commit/aab8e93a19005710d9f333756cdae5aa21c31058)), closes [#1082](https://github.com/serenity-js/serenity-js/issues/1082)
* **web:** corrected synchronisation in Web questions and interactions ([c3a0ad1](https://github.com/serenity-js/serenity-js/commit/c3a0ad16de311e71d7e82e4f463baa0ca6b18863))
* **web:** Photographer skips taking a screenshot if the Window is closed (DevTools protocol) ([b682577](https://github.com/serenity-js/serenity-js/commit/b682577ad649046fc1a4cd61a7315e11d60dcf32))
* **web:** refactored Selector and NativeElementLocator classes to simplify the implementation ([f0c8f11](https://github.com/serenity-js/serenity-js/commit/f0c8f113433958877d36f13d0bc7f355ea68d280))
* **web:** simplified the selectors ([b167e42](https://github.com/serenity-js/serenity-js/commit/b167e422eb66556845c31d5847b9fd33b707c764)), closes [#1074](https://github.com/serenity-js/serenity-js/issues/1074)


### Features

* **core:** forEach for List and PageElements ([4592fb7](https://github.com/serenity-js/serenity-js/commit/4592fb7e700bad17fd44d91bd9db169839802d01)), closes [#823](https://github.com/serenity-js/serenity-js/issues/823)
* **core:** List supports custom collectors ([cd3f2bc](https://github.com/serenity-js/serenity-js/commit/cd3f2bc1b536c8e56714aecd669bfed7ab078e0a))
* **core:** new implementation of List.where filters ([45b3c80](https://github.com/serenity-js/serenity-js/commit/45b3c8080ca467ac6362e5217e7899ca36a04cdc)), closes [#1074](https://github.com/serenity-js/serenity-js/issues/1074)
* **core:** support for Screenplay-style collection filters and mapping (List.where & .eachMappedTo) ([3d3c02e](https://github.com/serenity-js/serenity-js/commit/3d3c02ebe0ec5c6865f91f1991fd59ef0190a16c)), closes [#1074](https://github.com/serenity-js/serenity-js/issues/1074)
* **web:** isVisible checks if the element is in viewport and not hidden behind other elements ([429040f](https://github.com/serenity-js/serenity-js/commit/429040fb32b04cd4bc7524100635203fd8128eb6))
* **web:** new PageElement retrieval model based on Selectors ([48bd94f](https://github.com/serenity-js/serenity-js/commit/48bd94f3c29707b66dcf81a7522f7529b6f9fcfb))
* **web:** re-introduced PageElements.where DSL and universal By selectors ([39fe0a1](https://github.com/serenity-js/serenity-js/commit/39fe0a10edf7f652e93911159e4a4689c36d6876)), closes [#1081](https://github.com/serenity-js/serenity-js/issues/1081)



# [3.0.0-rc.2](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.1...v3.0.0-rc.2) (2021-12-09)


### Bug Fixes

* **lerna:** corrected versions of internal deps ([582b922](https://github.com/serenity-js/serenity-js/commit/582b922dbade08e970cb796f15aca909f606c079))



# [3.0.0-rc.1](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.0...v3.0.0-rc.1) (2021-12-09)


### Bug Fixes

* **examples:** migrated Protractor TodoMVC example to Serenity/JS 3.0 ([85a7cd9](https://github.com/serenity-js/serenity-js/commit/85a7cd98816fcf27eb643eea4b2138c9c5c7841d))
* **serenity-bdd:** upgraded Serenity BDD CLI to 2.6.0 ([93c32f2](https://github.com/serenity-js/serenity-js/commit/93c32f267709e20f5a27a4eed712a233711c8d31))



# [3.0.0-rc.0](https://github.com/serenity-js/serenity-js/compare/v2.32.5...v3.0.0-rc.0) (2021-12-08)


### Bug Fixes

* **core:** `formatted` can be configured to produce single- or multi-line descriptions ([21145a3](https://github.com/serenity-js/serenity-js/commit/21145a3dda17e87ea7bd950da4526b90f37a1edc))
* **core:** `inspected` produces a better description of functions used as parameters ([15535c6](https://github.com/serenity-js/serenity-js/commit/15535c675469651b835c0b358649a590f2c15b5d))
* **core:** 3.0 RC ([469d54e](https://github.com/serenity-js/serenity-js/commit/469d54e4f81ef430566b93852e3174826f8ef672)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **core:** answerProxy renamed to ProxyAnswer to better reflect its purpose ([a98fe41](https://github.com/serenity-js/serenity-js/commit/a98fe41378bc8475f027946e0f01a30f4789d57a))
* **core:** corrected type defs of Question.as ([681ce22](https://github.com/serenity-js/serenity-js/commit/681ce22259bf75161df7ce2454f4b6d73ea87259))
* **core:** exported createProxyAnswer to make it easier to use ([5471989](https://github.com/serenity-js/serenity-js/commit/547198985025d0ede2ab47ea89d8944960fb980d))
* **core:** removed Loop as it will be replaced ([0b63d27](https://github.com/serenity-js/serenity-js/commit/0b63d27745c905001adf3c219dd0e3cf44756320))
* **core:** removed Property as it will be replaced by new Question ([fd7fa10](https://github.com/serenity-js/serenity-js/commit/fd7fa10dfbaa0c0cba059c5f18920609c4bac014))
* **core:** removed Transform and mapping functions as they'll be replaced with new Question ([506eaea](https://github.com/serenity-js/serenity-js/commit/506eaeaf2df22cfde5d7ca6a8f413fc053556c2b))
* **core:** renamed "Model" type to "Adapter" to better reflect its purpose ([b4ea7a1](https://github.com/serenity-js/serenity-js/commit/b4ea7a100fac2c896990bf15cbc906de641196b8)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **cucumber:** support for recognising non-Serenity AssertionErrors in older version of Cucumber ([31e9e99](https://github.com/serenity-js/serenity-js/commit/31e9e9919c2fd1e87b3f4405d9b2a6ae0164e893))
* **deps:** updated WebdriverIO ([9de63d4](https://github.com/serenity-js/serenity-js/commit/9de63d460d9735abfc5bb066671f6f28c3274597))
* **deps:** web ([b075b8e](https://github.com/serenity-js/serenity-js/commit/b075b8ecd8e00014469dda15a90175d60ed80c91))
* **jasmine:** upgraded Jasmine to 3.10.0 ([707dbff](https://github.com/serenity-js/serenity-js/commit/707dbff16cf909a12c437984e156f55d2df1e2a0)), closes [jasmine/jasmine#1939](https://github.com/jasmine/jasmine/issues/1939)
* **protractor:** fixed the interaction to Switch ([762ca84](https://github.com/serenity-js/serenity-js/commit/762ca8406389a720d2ac6b8ab49b2519fbecfc21))
* **protractor:** lastScriptExecution.result() returns undefined instead of null for void functions ([997d87a](https://github.com/serenity-js/serenity-js/commit/997d87af2d825bffd47c0a1b3dbeee8ce572e391))
* **protractor:** modernised ProtractorParam to return a Screenplay Model ([43c2032](https://github.com/serenity-js/serenity-js/commit/43c2032e73c5e1ad3392396dec6fff476283833d))
* **protractor:** removed interaction to ResizeBrowserWindow in favour of Page.setViewportSize() ([b8e471d](https://github.com/serenity-js/serenity-js/commit/b8e471dc92fe7d930895571ce0bcb99066eb2206))
* **protractor:** replaced obsolete "Window", replaced by "Page" in @serenity-js/web ([a3442c4](https://github.com/serenity-js/serenity-js/commit/a3442c432082327f9081c269c02141c73b2e4eb3))
* **web:** added missing export ([c5ffc0a](https://github.com/serenity-js/serenity-js/commit/c5ffc0a83905c99ea0020577503170c427fdb9f2)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** corrected timestamp rounding when retrieving the expiry date of a cookie ([d636965](https://github.com/serenity-js/serenity-js/commit/d63696586618cd701e703e33dd8b476efaac65b6))
* **webdriverio:** ensure getLastScriptExecutionResult returns undefined for void functions ([aa00dfd](https://github.com/serenity-js/serenity-js/commit/aa00dfd3ab320a5d7ee786feea1ce0355ac42638))
* **webdriverio:** fixed synchronisation issue in ModalDialog ([12324b2](https://github.com/serenity-js/serenity-js/commit/12324b2cef9c161df8b68960d5b958c1f208f70a)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **webdriverio:** separated UIElement.hoverOver from UIElement.scrollIntoView ([cf4ca2c](https://github.com/serenity-js/serenity-js/commit/cf4ca2c531e0f90f9a27917e322359c13bfbc6e6))
* **webdriverio:** updated WebdriverIO to 7.13.2 ([ef79d19](https://github.com/serenity-js/serenity-js/commit/ef79d1962224e8dd04a1b0e099662c91ea118dfe))
* **webdriverio:** updated WebdriverIO to 7.16.7 ([3316e29](https://github.com/serenity-js/serenity-js/commit/3316e2905e68b1cabf76086da353072376f95f4a))
* **web:** ensure all Web interactions extend the same base class ([b358c0b](https://github.com/serenity-js/serenity-js/commit/b358c0b67c1de11af63e1e2142d3613692769cd6))
* **web:** fixed the interaction to Select ([10b7b74](https://github.com/serenity-js/serenity-js/commit/10b7b7446743b5866a1b458577ea7d2e11bf5a8f))
* **web:** optimised PhotoTakingStrategy ([085b7f7](https://github.com/serenity-js/serenity-js/commit/085b7f716033b22207af47edac58c896f46af62d))
* **web:** removed Cookie as it will be re-implemented ([cb3d081](https://github.com/serenity-js/serenity-js/commit/cb3d0813f9f0532bfe82be77fef0edec45e8ca3e))
* **web:** removed incorrect export ([ebf80c0](https://github.com/serenity-js/serenity-js/commit/ebf80c019af4db2a847e4b98599bce02b8acef23))
* **web:** removed incorrect import ([90cb025](https://github.com/serenity-js/serenity-js/commit/90cb0251a00a7bff098376110dcec2f9f2c5d5c0))
* **web:** removed window-specific APIs from BrowseTheWeb that got replaced by Page ([918f447](https://github.com/serenity-js/serenity-js/commit/918f447c1d8f326fbf5730f1aa61108045556212)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** renamed Element and associated classes to PageElement to avoid name conflicts ([1e4204b](https://github.com/serenity-js/serenity-js/commit/1e4204b5507469e6574c87a6d84454e39e8a813e))
* **web:** renamed PageElementList to PageElements to improve readability ([a9903a7](https://github.com/serenity-js/serenity-js/commit/a9903a7389b00106ef94d2bdb9f86a7fd04be541)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** standardised getters across PageElement implementations ([336472b](https://github.com/serenity-js/serenity-js/commit/336472b1a6882412f6a88483e51266909a1d51d0))
* **web:** wordsmithing of interface names ([5a1e76a](https://github.com/serenity-js/serenity-js/commit/5a1e76a9c162370e17238fcccc9f08e109d543c3))


### Features

* **core:** question.about creates a proxy around the answer to simplify the API ([25e0841](https://github.com/serenity-js/serenity-js/commit/25e084116ad28a02b55fbd8814b6ffa0375ec433))
* **core:** question.about produces "props" that proxy the methods of the underlying model ([f771872](https://github.com/serenity-js/serenity-js/commit/f771872c56b487e404002c3800fc8f3baaed804f))
* **protractor:** compatibility with @serenity-js/web ([9df4db2](https://github.com/serenity-js/serenity-js/commit/9df4db27a6e0ae62bf0d0e679a170d4865041043)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **protractor:** removed Protractor-specific Target implementations in favour of @serenity-js/web ([5cfc7e5](https://github.com/serenity-js/serenity-js/commit/5cfc7e53c977ae919398d9102f43985f393992db))
* **web:** a common way to run the tests for all the web adapters ([c7e584a](https://github.com/serenity-js/serenity-js/commit/c7e584a9bf288ebc7781affdb720097527e8ed3a))
* **web:** added Page.viewportSize and Page.setViewportSize methods ([4cabbe2](https://github.com/serenity-js/serenity-js/commit/4cabbe21a7fbac3457c6a6ea3d4442a62c3f1f3c))
* **web:** all Screenplay APIs migrated from @serenity-js/webdriverio to @serenity-js/web ([7b6b95d](https://github.com/serenity-js/serenity-js/commit/7b6b95dc255446c29ae213ba2a1d142d426d16c8))
* **webdriverio:** support for native WebdriverIO services ([8d5ad22](https://github.com/serenity-js/serenity-js/commit/8d5ad22594cdb2ebddedc58a30259ca8430e360c))
* **web:** interaction to set a Cookie ([c056439](https://github.com/serenity-js/serenity-js/commit/c056439746a8f57c3edd937b8862f2babb70e94e)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** interaction to setViewportSize of a Page ([dd7f180](https://github.com/serenity-js/serenity-js/commit/dd7f18057b857d2e69c19265888bfd5b15fda21b))
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
