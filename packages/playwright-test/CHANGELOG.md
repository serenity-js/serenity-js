# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.35.1](https://github.com/serenity-js/serenity-js/compare/v3.35.0...v3.35.1) (2025-09-28)


### Bug Fixes

* **deps:** update playwright dependencies to v1.55.1 ([53a98fe](https://github.com/serenity-js/serenity-js/commit/53a98fe0d655c12e317e060a2d617e0ceba43206))





# [3.35.0](https://github.com/serenity-js/serenity-js/compare/v3.34.2...v3.35.0) (2025-09-07)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.34.2](https://github.com/serenity-js/serenity-js/compare/v3.34.1...v3.34.2) (2025-09-07)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.34.1](https://github.com/serenity-js/serenity-js/compare/v3.34.0...v3.34.1) (2025-08-20)


### Bug Fixes

* **deps:** update dependency tiny-types to v1.24.1 ([14c705a](https://github.com/serenity-js/serenity-js/commit/14c705a83bd7b38dec34529fbb7875168dbc7f3c))
* **deps:** update playwright dependencies to v1.55.0 ([6b501cb](https://github.com/serenity-js/serenity-js/commit/6b501cbf975e6e1bf7729ccf245a858ab586b074))





# [3.34.0](https://github.com/serenity-js/serenity-js/compare/v3.33.1...v3.34.0) (2025-08-01)


### Bug Fixes

* **deps:** update dependency typescript to v5.9.2 ([8a40483](https://github.com/serenity-js/serenity-js/commit/8a40483203534445d93c5be6f4d8a747055fd79e))
* **deps:** update playwright dependencies to v1.54.2 ([b6b9413](https://github.com/serenity-js/serenity-js/commit/b6b9413ae87d1247a23f93dc26285eb6836b98ec))


### Features

* **rest:** support for bypassing proxy for selected urls ([ab1f41a](https://github.com/serenity-js/serenity-js/commit/ab1f41a98f121b4fc95e7a0fbea2c2393bba032d))





## [3.33.1](https://github.com/serenity-js/serenity-js/compare/v3.33.0...v3.33.1) (2025-07-28)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.32.5](https://github.com/serenity-js/serenity-js/compare/v3.32.4...v3.32.5) (2025-07-28)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.32.4](https://github.com/serenity-js/serenity-js/compare/v3.32.3...v3.32.4) (2025-07-13)


### Bug Fixes

* **core:** removed unnecessary tsconfig files from build artifacts ([6e4d4fa](https://github.com/serenity-js/serenity-js/commit/6e4d4fabed5d0bc2847bbf7cbc4ead10710ec32b))
* **deps:** update playwright dependencies to v1.54.1 ([d7fda0e](https://github.com/serenity-js/serenity-js/commit/d7fda0e24bf93f880a988b6772d0f562f7900af2))





## [3.32.3](https://github.com/serenity-js/serenity-js/compare/v3.32.2...v3.32.3) (2025-07-07)


### Bug Fixes

* **deps:** update playwright dependencies to v1.53.2 ([40ac26d](https://github.com/serenity-js/serenity-js/commit/40ac26d4f8e201457bfbba51c9aa57058e7745eb))
* **playwright-test:** support for reporting on programmatically skipped scenarios ([2c154d1](https://github.com/serenity-js/serenity-js/commit/2c154d1a7b0deb62d2d83bd58dc025318db2d4d3))





## [3.32.2](https://github.com/serenity-js/serenity-js/compare/v3.32.1...v3.32.2) (2025-06-21)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.32.1](https://github.com/serenity-js/serenity-js/compare/v3.32.0...v3.32.1) (2025-06-20)


### Bug Fixes

* **playwright-test:** added SerenityFixtures and SerenityWorkerFixtures to API docs ([887a7cf](https://github.com/serenity-js/serenity-js/commit/887a7cfb2d5505cd566cc26defdf6d1aaa145e40))





# [3.32.0](https://github.com/serenity-js/serenity-js/compare/v3.31.17...v3.32.0) (2025-06-20)


### Bug Fixes

* **deps:** update playwright dependencies to v1.53.1 ([6ea14ce](https://github.com/serenity-js/serenity-js/commit/6ea14ce83f307ff8e3e2cd48d5a3f532efb123c3))
* **playwright-test:** create an output directory for the event stream only when necessary ([33c2c60](https://github.com/serenity-js/serenity-js/commit/33c2c60d9ca6610e4211865e3a97f6d094854faa))
* **playwright-test:** retryable tests are no longer marked as "retried" if they pass upon first try ([e027284](https://github.com/serenity-js/serenity-js/commit/e027284f6994f1a46a800ca0990aa901a222210c))
* **serenity-bdd:** append ProjectTag to test name, if available ([f9174f0](https://github.com/serenity-js/serenity-js/commit/f9174f08661e9d45373cd0eee06382edb463bde0))


### Features

* **playwright-test:** actorCalled fixture available in beforeAll and afterAll hooks ([e3b2be5](https://github.com/serenity-js/serenity-js/commit/e3b2be5d173c93dd9955f6a4af41bef09d6e6e6c))
* **playwright-test:** aggregate retried test reports, filter tests by project ([6cc46db](https://github.com/serenity-js/serenity-js/commit/6cc46dbc073134dd6956fff04208c1e574f38b05))
* **playwright-test:** improved error handling of actor interactions in beforeAll and afterAll hooks ([2987bee](https://github.com/serenity-js/serenity-js/commit/2987beea84fc2db653054ab09ac71d922ee2352b))
* **playwright-test:** new internal Serenity/JS event reporting mechanism ([42ba5ad](https://github.com/serenity-js/serenity-js/commit/42ba5ad70f1bf99aad8bc5d57de462cac7c7da6c))
* **playwright-test:** serenity fixture is now available in the worker scope ([9f3a8be](https://github.com/serenity-js/serenity-js/commit/9f3a8bea93a4d7f45872a8b320d88cf4a1a11d40))
* **playwright-test:** support for reporting repeated tests ([47b864d](https://github.com/serenity-js/serenity-js/commit/47b864d79aee9b374bb6b6a86b2a313b6c22f584))
* **playwright-test:** support reporting actor interactions from beforeAll and afterAll hooks ([3909545](https://github.com/serenity-js/serenity-js/commit/3909545feba931f77bd846645cecc3c8f575208e))
* **playwright:** refactored SerenityFixtures, corrected BrowseTheWebWithPlaywright parameters ([9c62723](https://github.com/serenity-js/serenity-js/commit/9c627233bc93e38a8ae6e9ba531c31ba05ab707f))





## [3.31.17](https://github.com/serenity-js/serenity-js/compare/v3.31.16...v3.31.17) (2025-06-16)


### Bug Fixes

* **deps:** update playwright dependencies to v1.53.0 ([3404f12](https://github.com/serenity-js/serenity-js/commit/3404f12005fb2185a06566da233be73e4e8cde8d))





## [3.31.16](https://github.com/serenity-js/serenity-js/compare/v3.31.15...v3.31.16) (2025-06-05)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.31.15](https://github.com/serenity-js/serenity-js/compare/v3.31.14...v3.31.15) (2025-05-06)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.31.14](https://github.com/serenity-js/serenity-js/compare/v3.31.13...v3.31.14) (2025-04-28)


### Bug Fixes

* **deps:** update dependency typescript to v5.8.3 ([b19c09b](https://github.com/serenity-js/serenity-js/commit/b19c09b5e5e7d05e744bc0c8b0b49cd3af89483c))
* **deps:** update playwright dependencies to v1.52.0 ([fc5faed](https://github.com/serenity-js/serenity-js/commit/fc5faed239ea7af4f7c90f2345e8ff42257bd3ef))





## [3.31.13](https://github.com/serenity-js/serenity-js/compare/v3.31.12...v3.31.13) (2025-03-20)


### Bug Fixes

* **deps:** update playwright dependencies to v1.51.1 ([8d059c2](https://github.com/serenity-js/serenity-js/commit/8d059c2fb9ec5d6091b664a24a771205d96f2040))





## [3.31.12](https://github.com/serenity-js/serenity-js/compare/v3.31.11...v3.31.12) (2025-03-12)


### Bug Fixes

* **deps:** update playwright dependencies to v1.51.0 ([81dfdd4](https://github.com/serenity-js/serenity-js/commit/81dfdd4a4514d3f5b90a6c2cda7b54330f4e1d61))
* **playwright-test:** removed stop-gap type defs since Playwright now provides them correctly ([91d2484](https://github.com/serenity-js/serenity-js/commit/91d2484de8b508f672ac637b3bad121bd0d9487a)), closes [microsoft/playwright#24146](https://github.com/microsoft/playwright/issues/24146)





## [3.31.10](https://github.com/serenity-js/serenity-js/compare/v3.31.9...v3.31.10) (2025-03-05)


### Bug Fixes

* **deps:** update dependency typescript to v5.8.2 ([228c7fd](https://github.com/serenity-js/serenity-js/commit/228c7fddee3afcbf5015b147eeb816494ef6bd08))





## [3.31.9](https://github.com/serenity-js/serenity-js/compare/v3.31.8...v3.31.9) (2025-02-20)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.31.8](https://github.com/serenity-js/serenity-js/compare/v3.31.7...v3.31.8) (2025-02-04)


### Bug Fixes

* **deps:** update playwright dependencies to v1.50.1 ([66f4946](https://github.com/serenity-js/serenity-js/commit/66f494629f8198d19912cfc9fc5b578cc01da844))





## [3.31.7](https://github.com/serenity-js/serenity-js/compare/v3.31.6...v3.31.7) (2025-01-24)


### Bug Fixes

* **deps:** update playwright dependencies to v1.50.0 ([30ca259](https://github.com/serenity-js/serenity-js/commit/30ca2599ead451d190b780bff858f801077b26b7))





## [3.31.6](https://github.com/serenity-js/serenity-js/compare/v3.31.5...v3.31.6) (2025-01-16)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.31.5](https://github.com/serenity-js/serenity-js/compare/v3.31.4...v3.31.5) (2025-01-11)


### Bug Fixes

* **deps:** update dependency typescript to v5.7.3 ([cd87dd8](https://github.com/serenity-js/serenity-js/commit/cd87dd80ea55e73bac48afd9c670191a10dc97c4))





## [3.31.4](https://github.com/serenity-js/serenity-js/compare/v3.31.3...v3.31.4) (2025-01-01)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.31.3](https://github.com/serenity-js/serenity-js/compare/v3.31.2...v3.31.3) (2025-01-01)


### Bug Fixes

* **core:** migrated to PNPM ([43dbe6f](https://github.com/serenity-js/serenity-js/commit/43dbe6f440d8dd81811da303e542381a17d06b4d)), closes [#2664](https://github.com/serenity-js/serenity-js/issues/2664)





## [3.31.2](https://github.com/serenity-js/serenity-js/compare/v3.31.1...v3.31.2) (2024-12-26)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.31.1](https://github.com/serenity-js/serenity-js/compare/v3.31.0...v3.31.1) (2024-12-17)


### Bug Fixes

* **deps:** update playwright dependencies to v1.49.1 ([7f576dd](https://github.com/serenity-js/serenity-js/commit/7f576ddf31363968da5b8dacd013803f4cde7a2b))
* **playwright:** support playwright ~1.49.0 ([d2e3bae](https://github.com/serenity-js/serenity-js/commit/d2e3bae8148adcb59661f94eb175bce4d76217f7))





# [3.31.0](https://github.com/serenity-js/serenity-js/compare/v3.30.0...v3.31.0) (2024-12-12)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.30.0](https://github.com/serenity-js/serenity-js/compare/v3.29.5...v3.30.0) (2024-11-19)


### Bug Fixes

* **deps:** update playwright dependencies to v1.49.0 ([9d98f8e](https://github.com/serenity-js/serenity-js/commit/9d98f8e0d46004f8b3fa7e2f32ee0a03ce88558f))
* **playwright-test:** correctly report nested error cause ([1eab582](https://github.com/serenity-js/serenity-js/commit/1eab5828932934effe40716525a76e471119d836)), closes [microsoft/playwright#26848](https://github.com/microsoft/playwright/issues/26848) [#1823](https://github.com/serenity-js/serenity-js/issues/1823)





## [3.29.5](https://github.com/serenity-js/serenity-js/compare/v3.29.4...v3.29.5) (2024-11-03)


### Bug Fixes

* **deps:** update playwright dependencies to v1.48.2 ([e8dc2bd](https://github.com/serenity-js/serenity-js/commit/e8dc2bd008f19738a5e343b4f30b2008afaded57))





## [3.29.4](https://github.com/serenity-js/serenity-js/compare/v3.29.3...v3.29.4) (2024-10-08)


### Bug Fixes

* **deps:** update playwright dependencies to v1.48.0 ([54e8c32](https://github.com/serenity-js/serenity-js/commit/54e8c32e67e558751a8915949bb80b1bb3962e36))





## [3.29.3](https://github.com/serenity-js/serenity-js/compare/v3.29.2...v3.29.3) (2024-10-08)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.29.2](https://github.com/serenity-js/serenity-js/compare/v3.29.1...v3.29.2) (2024-09-25)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.29.1](https://github.com/serenity-js/serenity-js/compare/v3.29.0...v3.29.1) (2024-09-24)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.29.0](https://github.com/serenity-js/serenity-js/compare/v3.28.0...v3.29.0) (2024-09-24)


### Bug Fixes

* **deps:** update playwright dependencies to v1.47.2 ([be26cb2](https://github.com/serenity-js/serenity-js/commit/be26cb2773e418788fd4b9142f65c7782a618290))





# [3.28.0](https://github.com/serenity-js/serenity-js/compare/v3.27.0...v3.28.0) (2024-09-11)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.27.0](https://github.com/serenity-js/serenity-js/compare/v3.26.1...v3.27.0) (2024-09-06)


### Bug Fixes

* **core:** updated npm tags to improve discoverability ([432d331](https://github.com/serenity-js/serenity-js/commit/432d331aedb7b46fdd5291394521923ce66c1a2b))
* **deps:** update playwright dependencies to v1.47.0 ([0641e49](https://github.com/serenity-js/serenity-js/commit/0641e493c04c220562ec415c70afb2d80c387944))


### Features

* **core:** added support for Node 22, dropped support for Node 16 ([d5dea01](https://github.com/serenity-js/serenity-js/commit/d5dea013ed5d87f2e0cda8fa83da9fd021e4638d)), closes [#2518](https://github.com/serenity-js/serenity-js/issues/2518)





## [3.26.1](https://github.com/serenity-js/serenity-js/compare/v3.26.0...v3.26.1) (2024-09-03)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.26.0](https://github.com/serenity-js/serenity-js/compare/v3.25.5...v3.26.0) (2024-08-27)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.25.5](https://github.com/serenity-js/serenity-js/compare/v3.25.4...v3.25.5) (2024-08-18)


### Bug Fixes

* **deps:** update dependency tiny-types to v1.23.0 ([1c9a897](https://github.com/serenity-js/serenity-js/commit/1c9a897c100398632366bdef84d9dfde03f1af3c))
* **deps:** update playwright dependencies to v1.46.1 ([5cbed5d](https://github.com/serenity-js/serenity-js/commit/5cbed5d9f4f9e02d5824744791ddee2e7672f07e))





## [3.25.4](https://github.com/serenity-js/serenity-js/compare/v3.25.3...v3.25.4) (2024-08-07)


### Bug Fixes

* **deps:** update playwright dependencies to v1.46.0 ([000d43a](https://github.com/serenity-js/serenity-js/commit/000d43ae468595e78fdf5341b0d89432c3cc270a))





## [3.25.3](https://github.com/serenity-js/serenity-js/compare/v3.25.2...v3.25.3) (2024-07-25)


### Bug Fixes

* **deps:** update playwright dependencies to v1.45.3 ([89775e6](https://github.com/serenity-js/serenity-js/commit/89775e6b535b62c4a705db6ae463fd50be51c2bd))
* **playwright:** playwright is now a peer dependency ([d9c7307](https://github.com/serenity-js/serenity-js/commit/d9c73073b57f1394efec0860f23b193b5ff53d97))





## [3.25.2](https://github.com/serenity-js/serenity-js/compare/v3.25.1...v3.25.2) (2024-07-17)


### Bug Fixes

* **deps:** update playwright dependencies to v1.45.2 ([bf1d934](https://github.com/serenity-js/serenity-js/commit/bf1d934f5b9feca2b59192d4524d55e130b7bb80))





## [3.25.1](https://github.com/serenity-js/serenity-js/compare/v3.25.0...v3.25.1) (2024-07-10)


### Bug Fixes

* **core:** all the API docs now link to the online Serenity/JS API documentation ([f8f451d](https://github.com/serenity-js/serenity-js/commit/f8f451dffdb4caaa2e31a860f59d59470f4856ad))





# [3.25.0](https://github.com/serenity-js/serenity-js/compare/v3.24.1...v3.25.0) (2024-07-03)


### Bug Fixes

* **deps:** update playwright dependencies to v1.45.1 ([16cb866](https://github.com/serenity-js/serenity-js/commit/16cb8663a925affcde5718de760e34bda938147e))





## [3.24.1](https://github.com/serenity-js/serenity-js/compare/v3.24.0...v3.24.1) (2024-06-26)


### Bug Fixes

* **deps:** update playwright dependencies to v1.45.0 ([ef7eb4a](https://github.com/serenity-js/serenity-js/commit/ef7eb4aa6bca0aee2d20afadcc15ba0c56c1e28a))





# [3.24.0](https://github.com/serenity-js/serenity-js/compare/v3.23.2...v3.24.0) (2024-06-18)


### Features

* **core:** support for dynamic descriptions for Tasks and Interactions ([c1516f2](https://github.com/serenity-js/serenity-js/commit/c1516f2b1acb5937ad22012914ce38e15abe1276)), closes [#2223](https://github.com/serenity-js/serenity-js/issues/2223)





## [3.23.2](https://github.com/serenity-js/serenity-js/compare/v3.23.1...v3.23.2) (2024-05-24)


### Bug Fixes

* **deps:** update playwright dependencies to v1.44.1 ([8a602c9](https://github.com/serenity-js/serenity-js/commit/8a602c9905b8a64eda99a8c223303aa983d9752f))





## [3.23.1](https://github.com/serenity-js/serenity-js/compare/v3.23.0...v3.23.1) (2024-05-20)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.23.0](https://github.com/serenity-js/serenity-js/compare/v3.22.4...v3.23.0) (2024-05-12)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.22.4](https://github.com/serenity-js/serenity-js/compare/v3.22.3...v3.22.4) (2024-05-07)


### Bug Fixes

* **deps:** update playwright dependencies to v1.44.0 ([ae659d6](https://github.com/serenity-js/serenity-js/commit/ae659d6bbd389805061a163ac8e38386363636ec))





## [3.22.3](https://github.com/serenity-js/serenity-js/compare/v3.22.2...v3.22.3) (2024-05-01)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.22.2](https://github.com/serenity-js/serenity-js/compare/v3.22.1...v3.22.2) (2024-04-20)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.22.1](https://github.com/serenity-js/serenity-js/compare/v3.22.0...v3.22.1) (2024-04-17)


### Bug Fixes

* **deps:** update playwright dependencies to v1.43.1 ([fbbb2d4](https://github.com/serenity-js/serenity-js/commit/fbbb2d475f76aaf37ca1fb3f11871bfe91403cb9))





# [3.22.0](https://github.com/serenity-js/serenity-js/compare/v3.21.2...v3.22.0) (2024-04-11)


### Bug Fixes

* **deps:** update playwright dependencies to v1.43.0 ([f9a2f9d](https://github.com/serenity-js/serenity-js/commit/f9a2f9d837765843af76ade9a78f92e32e1d884f))
* **playwright-test:** support for Playwright Test 1.43.0 ([0162b6e](https://github.com/serenity-js/serenity-js/commit/0162b6e0b56e5cbf11ab03326181480b740f24ef))





## [3.21.2](https://github.com/serenity-js/serenity-js/compare/v3.21.1...v3.21.2) (2024-03-31)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.21.1](https://github.com/serenity-js/serenity-js/compare/v3.21.0...v3.21.1) (2024-03-16)


### Bug Fixes

* **core:** upgraded dependency on tiny-types to 1.22.0 ([2c0bb2a](https://github.com/serenity-js/serenity-js/commit/2c0bb2aeee7df7652853606c1ea10794157eb9fb))





# [3.21.0](https://github.com/serenity-js/serenity-js/compare/v3.20.0...v3.21.0) (2024-03-04)


### Bug Fixes

* **playwright-test:** support for reporting tags registered using the new Playwright 1.42 tags API ([9d57157](https://github.com/serenity-js/serenity-js/commit/9d571573cd9d8b52ddcb286f1160c7011dea7590))





# [3.20.0](https://github.com/serenity-js/serenity-js/compare/v3.19.0...v3.20.0) (2024-03-02)


### Bug Fixes

* **deps:** update playwright dependencies to v1.42.1 ([dc20ed5](https://github.com/serenity-js/serenity-js/commit/dc20ed5eb29d41fdb8d87b375c2c7a90a041bdca))





# [3.19.0](https://github.com/serenity-js/serenity-js/compare/v3.18.1...v3.19.0) (2024-03-01)


### Bug Fixes

* **console-reporter:** fix comments ([e8b21dd](https://github.com/serenity-js/serenity-js/commit/e8b21ddb40c5addc53bdcfb212770f199f026e11))


### Features

* **console-reporter:** global exception handling v1 ([cf117f1](https://github.com/serenity-js/serenity-js/commit/cf117f16ba6623e45b3bcf0d357a91539700f55b))
* **console-reporter:** revert to only global error handling ([a375788](https://github.com/serenity-js/serenity-js/commit/a3757886275c854c8cc6d55aedbc0d26916cde9f))
* **console-reporter:** test with reporter developement ([85e2bf1](https://github.com/serenity-js/serenity-js/commit/85e2bf1ad06b00aa7d917e762ce0c2e0cb964533))





## [3.18.1](https://github.com/serenity-js/serenity-js/compare/v3.18.0...v3.18.1) (2024-02-23)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.18.0](https://github.com/serenity-js/serenity-js/compare/v3.17.0...v3.18.0) (2024-02-17)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.17.0](https://github.com/serenity-js/serenity-js/compare/v3.16.2...v3.17.0) (2024-02-10)


### Bug Fixes

* **playwright-test:** fix lint issue, refactors and add integration tests to custom tags reporting ([0f055c7](https://github.com/serenity-js/serenity-js/commit/0f055c7f4e0a9f6d29ef20c615c2055baebf85ec))


### Features

* **playwright-test:** announce tags automatically if present on the test title ([00b9ef8](https://github.com/serenity-js/serenity-js/commit/00b9ef8dc091835941fb643a9fd07c09a9500aaa))





## [3.16.2](https://github.com/serenity-js/serenity-js/compare/v3.16.1...v3.16.2) (2024-02-05)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.16.1](https://github.com/serenity-js/serenity-js/compare/v3.16.0...v3.16.1) (2024-02-03)


### Bug Fixes

* **core:** build with TypeScript 5.2 ([2f261ee](https://github.com/serenity-js/serenity-js/commit/2f261ee92ae4d75b1d5b576d30083c8ecacbcb95))
* **deps:** update playwright dependencies to v1.41.2 ([0975517](https://github.com/serenity-js/serenity-js/commit/0975517718d60e877bc9ac256b4fcf146be6c22e))





# [3.16.0](https://github.com/serenity-js/serenity-js/compare/v3.15.1...v3.16.0) (2024-02-01)


### Bug Fixes

* **deps:** update playwright dependencies to v1.41.1 ([a1a39ee](https://github.com/serenity-js/serenity-js/commit/a1a39ee2e30506849d4589a9588a5ac7dfb0adb8))


### Features

* **playwright-test:** improved requirements reporting ([3b99112](https://github.com/serenity-js/serenity-js/commit/3b99112b2eb0add2440d88a6485ee23e7acac75e))
* **playwright-test:** support for nested requirements reporting ([37ef679](https://github.com/serenity-js/serenity-js/commit/37ef679bde723af856d94bc64781f189a59213ed))





## [3.15.1](https://github.com/serenity-js/serenity-js/compare/v3.15.0...v3.15.1) (2024-01-19)


### Bug Fixes

* **deps:** update playwright dependencies to v1.41.0 ([bb2dc99](https://github.com/serenity-js/serenity-js/commit/bb2dc99bf8c94536a0863c9c60d5461a9b3dfe19))





# [3.15.0](https://github.com/serenity-js/serenity-js/compare/v3.14.2...v3.15.0) (2024-01-12)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.14.2](https://github.com/serenity-js/serenity-js/compare/v3.14.1...v3.14.2) (2023-12-12)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.14.1](https://github.com/serenity-js/serenity-js/compare/v3.14.0...v3.14.1) (2023-12-10)


### Bug Fixes

* **core:** added provenance statements ([04c2d87](https://github.com/serenity-js/serenity-js/commit/04c2d878be0f2d853b14e4fa390f312688b868cf))
* **core:** pinned all the direct dependencies ([498b336](https://github.com/serenity-js/serenity-js/commit/498b33614f678327ba207b30e3b2452728545aaf))





# [3.14.0](https://github.com/serenity-js/serenity-js/compare/v3.13.3...v3.14.0) (2023-12-02)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.40.1 ([da2e7ba](https://github.com/serenity-js/serenity-js/commit/da2e7ba610954a20bd33ccae702f285874484399))
* **playwright-test:** corrected proxy protocol detection and configuration ([090b322](https://github.com/serenity-js/serenity-js/commit/090b322fd54b2c654c6b9ff30a6aaa172b2ac8fd))


### Features

* **core:** nested error cause is now added to the main error message ([815c8ce](https://github.com/serenity-js/serenity-js/commit/815c8ce54205d813224cb5746e42bc48b7c388c9)), closes [#1823](https://github.com/serenity-js/serenity-js/issues/1823)





## [3.13.3](https://github.com/serenity-js/serenity-js/compare/v3.13.2...v3.13.3) (2023-11-22)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.40.0 ([56c6ec0](https://github.com/serenity-js/serenity-js/commit/56c6ec03aff4db0a7d9bcd4d216c934f551c8dfd))





## [3.13.2](https://github.com/serenity-js/serenity-js/compare/v3.13.1...v3.13.2) (2023-11-14)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.13.1](https://github.com/serenity-js/serenity-js/compare/v3.13.0...v3.13.1) (2023-11-07)


### Bug Fixes

* **deps:** update dependency tiny-types to ^1.21.0 ([d4921f9](https://github.com/serenity-js/serenity-js/commit/d4921f9cedb502487c176216fbf15dd2ef83dcc4))





# [3.13.0](https://github.com/serenity-js/serenity-js/compare/v3.12.0...v3.13.0) (2023-10-19)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.39.0 ([32af6b0](https://github.com/serenity-js/serenity-js/commit/32af6b02cea254cd3dcf5aa2a6318d3145d0af13))





# [3.12.0](https://github.com/serenity-js/serenity-js/compare/v3.11.1...v3.12.0) (2023-10-09)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.11.1](https://github.com/serenity-js/serenity-js/compare/v3.11.0...v3.11.1) (2023-10-04)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.11.0](https://github.com/serenity-js/serenity-js/compare/v3.10.4...v3.11.0) (2023-10-03)


### Features

* **playwright-test:** enabled the ability to CallAnApi for all default actors ([436cde5](https://github.com/serenity-js/serenity-js/commit/436cde5283c14cea420000389d7c2c73e6122764)), closes [#1876](https://github.com/serenity-js/serenity-js/issues/1876)
* **playwright-test:** explicit proxy config will override env variables for REST interaction ([1c277d6](https://github.com/serenity-js/serenity-js/commit/1c277d6e45064fbb4ab3432c11d125f529268b5c)), closes [#1949](https://github.com/serenity-js/serenity-js/issues/1949)
* **web:** ability to CallAnApi is now available by default ([dfaf8e4](https://github.com/serenity-js/serenity-js/commit/dfaf8e4f4cb40f9be99624f0d616ebcf012c1fb0)), closes [#1876](https://github.com/serenity-js/serenity-js/issues/1876)





## [3.10.4](https://github.com/serenity-js/serenity-js/compare/v3.10.3...v3.10.4) (2023-09-22)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.38.1 ([0072ddb](https://github.com/serenity-js/serenity-js/commit/0072ddbe42cc147e9cce5a7bca79bc87c707e1ce))





## [3.10.3](https://github.com/serenity-js/serenity-js/compare/v3.10.2...v3.10.3) (2023-09-15)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.38.0 ([0b8074b](https://github.com/serenity-js/serenity-js/commit/0b8074b19155a38aa2009049d9a395b7026d12b3))
* **playwright-test:** simplified and documented implementing custom Playwright Test fixtures ([61fc2bc](https://github.com/serenity-js/serenity-js/commit/61fc2bce72c9758658851949afac84d573698677)), closes [microsoft/playwright#24146](https://github.com/microsoft/playwright/issues/24146)





## [3.10.2](https://github.com/serenity-js/serenity-js/compare/v3.10.1...v3.10.2) (2023-09-10)


### Bug Fixes

* **core:** updated installation instruction in the README ([ec3f277](https://github.com/serenity-js/serenity-js/commit/ec3f2778334abbd7324497ceaa2df9f0560a103e)), closes [#1915](https://github.com/serenity-js/serenity-js/issues/1915)





## [3.10.1](https://github.com/serenity-js/serenity-js/compare/v3.10.0...v3.10.1) (2023-09-01)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.10.0](https://github.com/serenity-js/serenity-js/compare/v3.9.1...v3.10.0) (2023-08-23)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.9.1](https://github.com/serenity-js/serenity-js/compare/v3.9.0...v3.9.1) (2023-08-18)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.37.1 ([3a13bba](https://github.com/serenity-js/serenity-js/commit/3a13bba2611ef8dee4423d8a55a814be041fe63a))





# [3.9.0](https://github.com/serenity-js/serenity-js/compare/v3.8.0...v3.9.0) (2023-08-04)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.8.0](https://github.com/serenity-js/serenity-js/compare/v3.7.2...v3.8.0) (2023-08-01)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.7.2](https://github.com/serenity-js/serenity-js/compare/v3.7.1...v3.7.2) (2023-07-26)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.36.2 ([f9cc78f](https://github.com/serenity-js/serenity-js/commit/f9cc78fb75f431f92ef3788e9ed1e39d18039eac))
* **playwright-test:** simplified exported types, as per [@mxschmitt](https://github.com/mxschmitt) suggestion ([94874ba](https://github.com/serenity-js/serenity-js/commit/94874bae848713523b3513b91551097d6090351a)), closes [microsoft/playwright#24146](https://github.com/microsoft/playwright/issues/24146) [microsoft/TypeScript#5711](https://github.com/microsoft/TypeScript/issues/5711)





## [3.7.1](https://github.com/serenity-js/serenity-js/compare/v3.7.0...v3.7.1) (2023-07-22)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.7.0](https://github.com/serenity-js/serenity-js/compare/v3.6.1...v3.7.0) (2023-07-20)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.36.1 ([b86289b](https://github.com/serenity-js/serenity-js/commit/b86289b3f6d703baa9867ad167502de102591545))


### Features

* **playwright:** support for parentElement.closestTo(childElement) API ([cee2c48](https://github.com/serenity-js/serenity-js/commit/cee2c48e63cc8edbfc9daece57e9966f8833beeb)), closes [#1784](https://github.com/serenity-js/serenity-js/issues/1784)





## [3.6.1](https://github.com/serenity-js/serenity-js/compare/v3.6.0...v3.6.1) (2023-07-11)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.36.0 ([8b60383](https://github.com/serenity-js/serenity-js/commit/8b6038338b35d04072b166a9b66f63fa24af8dc0))





# [3.6.0](https://github.com/serenity-js/serenity-js/compare/v3.5.0...v3.6.0) (2023-07-11)


### Bug Fixes

* **deps:** update dependency tiny-types to ^1.20.0 ([6d7bf43](https://github.com/serenity-js/serenity-js/commit/6d7bf43c6135968bc90869cb8f9782ed70ca8dd9))


### Features

* **playwright-test:** enable BrowseTheWebWithPlaywright to reuse an existing page instance ([5c2deb1](https://github.com/serenity-js/serenity-js/commit/5c2deb1853f27884fcdaccccc0b1b108c0a8489b)), closes [#1784](https://github.com/serenity-js/serenity-js/issues/1784)
* **playwright-test:** introducing Component Testing with Serenity/JS and Playwright Test ([7b3c6c8](https://github.com/serenity-js/serenity-js/commit/7b3c6c83d5caa48b4362dee0f30a154f00cb46e2)), closes [#1784](https://github.com/serenity-js/serenity-js/issues/1784)





# [3.5.0](https://github.com/serenity-js/serenity-js/compare/v3.4.2...v3.5.0) (2023-07-02)


### Bug Fixes

* **core:** code clean-up: use type-only TypeScript imports where possible ([aa49150](https://github.com/serenity-js/serenity-js/commit/aa49150ca7f367363bb6fcc5e054da8bd820825e))





## [3.4.2](https://github.com/serenity-js/serenity-js/compare/v3.4.1...v3.4.2) (2023-06-30)


### Bug Fixes

* **playwright-test:** preserve Playwright Test-specific reporting when overriding actors ([8bf0bbb](https://github.com/serenity-js/serenity-js/commit/8bf0bbb86fd7f6d4f829ff943d3f970b9a960cc4))





## [3.4.1](https://github.com/serenity-js/serenity-js/compare/v3.4.0...v3.4.1) (2023-06-23)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.35.1 ([9124e2e](https://github.com/serenity-js/serenity-js/commit/9124e2e33a78ec1cd4c141abfad3f4874e5c3485))





# [3.4.0](https://github.com/serenity-js/serenity-js/compare/v3.3.1...v3.4.0) (2023-06-10)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.35.0 ([fb4359f](https://github.com/serenity-js/serenity-js/commit/fb4359f9a95f7ea4701590f71dab41ba4ed4fd02))


### Features

* **core:** compile Serenity/JS against ES2021 ([6b31184](https://github.com/serenity-js/serenity-js/commit/6b31184986f78b454ec1eeed53553fba8ebc868c))





## [3.3.1](https://github.com/serenity-js/serenity-js/compare/v3.3.0...v3.3.1) (2023-06-08)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.3.0](https://github.com/serenity-js/serenity-js/compare/v3.2.1...v3.3.0) (2023-06-01)


### Bug Fixes

* **playwright-test:** corrected synchronisation of the `platform` fixture ([7156f84](https://github.com/serenity-js/serenity-js/commit/7156f840dc8fe5688d25aca5ba87d925158e9c7d)), closes [#1717](https://github.com/serenity-js/serenity-js/issues/1717)
* **playwright:** support for Playwright 1.34.0 ([5d591c7](https://github.com/serenity-js/serenity-js/commit/5d591c71e89ac4cfd41b8f7e3a1c9017f962d9e3))
* **playwright:** updated Playwright to 1.34.2 ([c944031](https://github.com/serenity-js/serenity-js/commit/c94403199a349d59bb777b981897039c102f243f))
* **playwright:** upgraded to Playwright 1.34.3 ([0ded19e](https://github.com/serenity-js/serenity-js/commit/0ded19e8ef3aea74307ab3bbd69ff5f7b3c9f78b))


### Features

* **playwright-test:** improved integration with Playwright Test ([45b324f](https://github.com/serenity-js/serenity-js/commit/45b324f4b2e2992dc2df78c18013f2f235ff91b9)), closes [#1717](https://github.com/serenity-js/serenity-js/issues/1717)
* **playwright-test:** much more detailed Playwright Test reports ([5980a1e](https://github.com/serenity-js/serenity-js/commit/5980a1e37047d71199cc169271fa11869e98355b)), closes [#1717](https://github.com/serenity-js/serenity-js/issues/1717)





## [3.2.1](https://github.com/serenity-js/serenity-js/compare/v3.2.0...v3.2.1) (2023-05-15)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.2.0](https://github.com/serenity-js/serenity-js/compare/v3.1.6...v3.2.0) (2023-05-05)


### Bug Fixes

* **core:** use "types" instead of "typings" in package.json files ([0696639](https://github.com/serenity-js/serenity-js/commit/0696639e6333e9d8ef24230928609664513ff244)), closes [#1682](https://github.com/serenity-js/serenity-js/issues/1682)
* **deps:** update playwright dependencies to ^1.33.0 ([e1cebc4](https://github.com/serenity-js/serenity-js/commit/e1cebc434eba9242c4bba33268ab48b76c486c5f))


### Features

* **core:** introduced support for Node.js 20, dropped support for Node.js 14 ([d0f58a6](https://github.com/serenity-js/serenity-js/commit/d0f58a6ff1f03a4b7d9490af3c2ff33f2d1fef48)), closes [#1678](https://github.com/serenity-js/serenity-js/issues/1678)





## [3.1.6](https://github.com/serenity-js/serenity-js/compare/v3.1.5...v3.1.6) (2023-04-18)


### Bug Fixes

* **webdriverio:** upgraded to TypeScript 5 and WebdriverIO 7.31.1 ([15b1ba7](https://github.com/serenity-js/serenity-js/commit/15b1ba77e157d77123a2e8922414e937c0d2869d)), closes [#1558](https://github.com/serenity-js/serenity-js/issues/1558) [#1651](https://github.com/serenity-js/serenity-js/issues/1651)





## [3.1.5](https://github.com/serenity-js/serenity-js/compare/v3.1.4...v3.1.5) (2023-04-18)


### Bug Fixes

* **serenity-bdd:** improved support for nested requirement hierarchies with Cucumber.js ([749fb0f](https://github.com/serenity-js/serenity-js/commit/749fb0f9501575ac8152b01a980e4959a823471f)), closes [/github.com/serenity-bdd/serenity-core/blob/8f7d14c6dad47bb58a1585fef5f9d9a44bb963fd/serenity-model/src/main/java/net/thucydides/core/requirements/AbstractRequirementsTagProvider.java#L36](https://github.com//github.com/serenity-bdd/serenity-core/blob/8f7d14c6dad47bb58a1585fef5f9d9a44bb963fd/serenity-model/src/main/java/net/thucydides/core/requirements/AbstractRequirementsTagProvider.java/issues/L36) [#1649](https://github.com/serenity-js/serenity-js/issues/1649)





## [3.1.3](https://github.com/serenity-js/serenity-js/compare/v3.1.2...v3.1.3) (2023-04-14)


### Bug Fixes

* **playwright:** updated Playwright to 1.32.3 ([1d7f77b](https://github.com/serenity-js/serenity-js/commit/1d7f77bb0665ada8193b56598f31d3fb16c2384a))





## [3.1.2](https://github.com/serenity-js/serenity-js/compare/v3.1.1...v3.1.2) (2023-04-07)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.1.1](https://github.com/serenity-js/serenity-js/compare/v3.1.0...v3.1.1) (2023-04-05)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.32.2 ([8398ec3](https://github.com/serenity-js/serenity-js/commit/8398ec364836f45af9e5734687e1655ca10a7784))
* **playwright-test:** use custom interactionTimeout when provided in the config ([71c0401](https://github.com/serenity-js/serenity-js/commit/71c0401539b722ad6858d9dcb6393593254c3787)), closes [#1604](https://github.com/serenity-js/serenity-js/issues/1604)





# [3.1.0](https://github.com/serenity-js/serenity-js/compare/v3.0.1...v3.1.0) (2023-04-02)

**Note:** Version bump only for package @serenity-js/playwright-test





## [3.0.1](https://github.com/serenity-js/serenity-js/compare/v3.0.0...v3.0.1) (2023-03-25)


### Bug Fixes

* **deps:** update playwright dependencies to ^1.32.1 ([3ba8d4c](https://github.com/serenity-js/serenity-js/commit/3ba8d4cdde99e48e5b74086d6ebf10630916f151))





# [3.0.0](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.45...v3.0.0) (2023-03-23)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.0.0-rc.45](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.44...v3.0.0-rc.45) (2023-03-22)


### Bug Fixes

* **deps:** update dependency deepmerge to ^4.3.1 ([d605a6b](https://github.com/serenity-js/serenity-js/commit/d605a6ba034b0d9d5d716c82ea496bd726a86348))





# [3.0.0-rc.44](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.43...v3.0.0-rc.44) (2023-03-19)


### Bug Fixes

* **core:** support for NPM 9 ([0493474](https://github.com/serenity-js/serenity-js/commit/0493474a1e28b86b1b60f69ec0d591c1a3265425))
* **deps:** update dependency tiny-types to ^1.19.1 ([ce335eb](https://github.com/serenity-js/serenity-js/commit/ce335ebca434d1fd0e6e809a65a0882fd10a311a))





# [3.0.0-rc.43](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.42...v3.0.0-rc.43) (2023-03-10)


### Bug Fixes

* **deps:** update dependency deepmerge to ^4.3.0 ([ac08d09](https://github.com/serenity-js/serenity-js/commit/ac08d091eb61a666c9b9c53209b59fe7157c06d9))
* **deps:** update playwright dependencies to ^1.31.2 ([ebac2ff](https://github.com/serenity-js/serenity-js/commit/ebac2ff37b7a922686daed0201d122f52b1d1040))
* **playwright-test:** ensure each new actor gets their own Playwright browser ([f4c527b](https://github.com/serenity-js/serenity-js/commit/f4c527b27446e32c31a230de3a4d29575ecc8c34)), closes [#1523](https://github.com/serenity-js/serenity-js/issues/1523)





# [3.0.0-rc.42](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.41...v3.0.0-rc.42) (2023-02-12)


### Bug Fixes

* **core:** event TestRunFinished now incidates the Outcome of the test suite ([a941056](https://github.com/serenity-js/serenity-js/commit/a9410566891e543101b935a80db9c7daea0c9944)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)
* **playwright-test:** default to using file name as feature name when describe blocks are absent ([1295b04](https://github.com/serenity-js/serenity-js/commit/1295b04adcd12a9d7eaef795e1080bb1c5a9056d)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)





# [3.0.0-rc.41](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.40...v3.0.0-rc.41) (2023-02-07)


### Bug Fixes

* **core:** easier configuration and automatic colour support detection for AnsiDiffFormatter ([637ed44](https://github.com/serenity-js/serenity-js/commit/637ed44ffb16484544ade975bcbc4c3929ffe8f9)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **playwright:** upgraded Playwright to 1.30.0 ([305a2c2](https://github.com/serenity-js/serenity-js/commit/305a2c258c06aa55685f99237cf3d3ce3c590122))


### Features

* **assertions:** diffs included in RuntimeErrors are now colour-coded ([f88efb4](https://github.com/serenity-js/serenity-js/commit/f88efb48180924351e8f7b25c44f3560b0e01b0d)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **core:** overridable abilities ([03966cc](https://github.com/serenity-js/serenity-js/commit/03966ccae40d102b7dbca1125beb90ceda8fbc50))





# [3.0.0-rc.40](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.39...v3.0.0-rc.40) (2023-01-06)


### Bug Fixes

* **playwright-test:** corrected invalid import path ([2c46662](https://github.com/serenity-js/serenity-js/commit/2c46662ba37cb43d0a487c265c087114d8dda518))





# [3.0.0-rc.39](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.38...v3.0.0-rc.39) (2023-01-05)


### Bug Fixes

* **core:** simplified AsyncOperation events ([ac1a88f](https://github.com/serenity-js/serenity-js/commit/ac1a88f95560b5f163ac3f2302f4274f4bf99455))
* **core:** simplified internal AsyncOperation events to separate service name from task description ([0162d28](https://github.com/serenity-js/serenity-js/commit/0162d287c84a4ab716e5e655cfc2b816ba89f394))
* **playwright-test:** better names for screenshots attached to Playwright Test reports ([8c04334](https://github.com/serenity-js/serenity-js/commit/8c043349165a090daf34fb1c363da47003130a53))


### Features

* **playwright-test:** annotate Playwright Test reports with Serenity/JS tags ([5e4a513](https://github.com/serenity-js/serenity-js/commit/5e4a513a5cd33cbff459148f365f90847c63518c))
* **playwright-test:** custom actors can now be defined in playwright config file ([117da34](https://github.com/serenity-js/serenity-js/commit/117da340c0a9bea214b2a3ea8182d803608697dc))
* **playwright-test:** interoperability between Serenity/JS default `actor` and `page` ([91803de](https://github.com/serenity-js/serenity-js/commit/91803de95c5bd1a8a475e5948e15cc49689a058c))
* **playwright-test:** support for Photographer and automated screenshots upon activity failure ([c5527ca](https://github.com/serenity-js/serenity-js/commit/c5527caee65cb89014ea9cb28b949cf45d7463a3))





# [3.0.0-rc.38](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.37...v3.0.0-rc.38) (2022-12-28)


### Bug Fixes

* **playwright:** introduced an explicit dependency on Playwright ([2136132](https://github.com/serenity-js/serenity-js/commit/2136132a95bfb4181c4854291cfeeacb876b9cfb))





# [3.0.0-rc.37](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.36...v3.0.0-rc.37) (2022-12-18)


### Features

* **playwright:** support for Playwright 1.29.0 ([3dd0635](https://github.com/serenity-js/serenity-js/commit/3dd0635d66df2571fb6d8d3e43d3feed71462da9))





# [3.0.0-rc.36](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.35...v3.0.0-rc.36) (2022-11-28)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.0.0-rc.35](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.34...v3.0.0-rc.35) (2022-11-25)


### Bug Fixes

* **playwright:** upgraded to Playwright 1.28.1 ([e9c4c1c](https://github.com/serenity-js/serenity-js/commit/e9c4c1c5c4467423c8254baeab0d0603d90c0d96))





# [3.0.0-rc.34](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.33...v3.0.0-rc.34) (2022-11-21)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.0.0-rc.33](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.32...v3.0.0-rc.33) (2022-11-07)


### Bug Fixes

* **playwright:** upgraded Playwright to 1.27.1 ([1345644](https://github.com/serenity-js/serenity-js/commit/1345644dc6c0b4f09ca1f9cfe97a793e226e747c))





# [3.0.0-rc.32](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.31...v3.0.0-rc.32) (2022-10-12)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.0.0-rc.31](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.30...v3.0.0-rc.31) (2022-10-07)


### Bug Fixes

* **playwright:** upgraded Playwright to 1.26.1 ([b056613](https://github.com/serenity-js/serenity-js/commit/b056613b2ab53807ff7af9b91229bde7d46879f3))





# [3.0.0-rc.30](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.29...v3.0.0-rc.30) (2022-10-05)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.0.0-rc.29](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.28...v3.0.0-rc.29) (2022-10-01)

**Note:** Version bump only for package @serenity-js/playwright-test





# [3.0.0-rc.28](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.27...v3.0.0-rc.28) (2022-09-30)


### Bug Fixes

* **core:** activity is now able to detect invocation location on Node 14 ([41f4776](https://github.com/serenity-js/serenity-js/commit/41f4776736620bc32d474d9b66f69c742f8eca96)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** bulk-attach all Serenity/JS events to Playwright report ([a5f3d7c](https://github.com/serenity-js/serenity-js/commit/a5f3d7cfb8148cc80275a0736976726432b174f3)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** wait for Photographer to finish taking screenshots before dismissing actors ([b0c5adb](https://github.com/serenity-js/serenity-js/commit/b0c5adba83fc92624e91c7385b38f0061cf5a6ed)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright:** corrected not(isPresent()) for PlaywrightPageElement ([0693b2f](https://github.com/serenity-js/serenity-js/commit/0693b2f2666a8de327c990c72ecf42fc3d7da498)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright:** upgraded Playwright to 1.26.0 ([a13ab3c](https://github.com/serenity-js/serenity-js/commit/a13ab3c54b37a5017beadf1db2b2cd2e747d8ab4))


### Features

* **console-reporter:** improved support for tests executed in parallel ([01264ce](https://github.com/serenity-js/serenity-js/commit/01264ce6110a3199265468f633eee5623fabe008)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** serenity/JS stage crew members can now be configured using `string` ([786cdad](https://github.com/serenity-js/serenity-js/commit/786cdadcda8e031e06b8bee9698a87a7af00d90c)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240) [#594](https://github.com/serenity-js/serenity-js/issues/594)
* **playwright-test:** first draft of the Serenity/JS Playwright Test reporter ([b9e3d89](https://github.com/serenity-js/serenity-js/commit/b9e3d89752c07ef0fd54ad748c31fd7207665c3a)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** improved Playwright Test reports ([6c6b537](https://github.com/serenity-js/serenity-js/commit/6c6b5379dfc324a4fb75d758daa7782109f1c5ab)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** support Screenplay Pattern-style scenarios ([c425c54](https://github.com/serenity-js/serenity-js/commit/c425c548034de1b8db60e83671abcb77f9b246e5)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
