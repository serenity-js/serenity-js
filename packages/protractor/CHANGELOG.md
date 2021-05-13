# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.28.1](https://github.com/serenity-js/serenity-js/compare/v2.28.0...v2.28.1) (2021-05-13)

**Note:** Version bump only for package @serenity-js/protractor





# [2.28.0](https://github.com/serenity-js/serenity-js/compare/v2.27.1...v2.28.0) (2021-05-12)


### Bug Fixes

* **deps:** migrated from TSLint to ESLint ([0c7580b](https://github.com/serenity-js/serenity-js/commit/0c7580b5fa06f9fa1796f0e9e19da45190940dfd)), closes [#842](https://github.com/serenity-js/serenity-js/issues/842)


### Features

* **node:** introduced support for Node.js 16.x, dropped support for Node.js 10.x ([0f67dcc](https://github.com/serenity-js/serenity-js/commit/0f67dcc63f904a4df48e331d12a37f40f6814cee)), closes [#842](https://github.com/serenity-js/serenity-js/issues/842)
* **protractor:** implemented right click ([eeddb7f](https://github.com/serenity-js/serenity-js/commit/eeddb7fd3664e19d27c640b7f866c46b4c480c38)), closes [#833](https://github.com/serenity-js/serenity-js/issues/833)





## [2.27.1](https://github.com/serenity-js/serenity-js/compare/v2.27.0...v2.27.1) (2021-05-04)

**Note:** Version bump only for package @serenity-js/protractor





# [2.27.0](https://github.com/serenity-js/serenity-js/compare/v2.26.2...v2.27.0) (2021-05-03)

**Note:** Version bump only for package @serenity-js/protractor





## [2.26.2](https://github.com/serenity-js/serenity-js/compare/v2.26.1...v2.26.2) (2021-04-22)

**Note:** Version bump only for package @serenity-js/protractor





## [2.26.1](https://github.com/serenity-js/serenity-js/compare/v2.26.0...v2.26.1) (2021-04-21)

**Note:** Version bump only for package @serenity-js/protractor





# [2.26.0](https://github.com/serenity-js/serenity-js/compare/v2.25.9...v2.26.0) (2021-04-15)

**Note:** Version bump only for package @serenity-js/protractor





## [2.25.9](https://github.com/serenity-js/serenity-js/compare/v2.25.8...v2.25.9) (2021-04-10)

**Note:** Version bump only for package @serenity-js/protractor





## [2.25.8](https://github.com/serenity-js/serenity-js/compare/v2.25.7...v2.25.8) (2021-03-27)

**Note:** Version bump only for package @serenity-js/protractor





## [2.25.7](https://github.com/serenity-js/serenity-js/compare/v2.25.6...v2.25.7) (2021-03-23)


### Bug Fixes

* **deps-dev:** (internal) standardised internal dev-dependency versions across Serenity/JS modules ([a411cea](https://github.com/serenity-js/serenity-js/commit/a411ceabadc83e82ec87a492a1738b13773adb13))





## [2.25.6](https://github.com/serenity-js/serenity-js/compare/v2.25.5...v2.25.6) (2021-03-22)

**Note:** Version bump only for package @serenity-js/protractor





## [2.25.5](https://github.com/serenity-js/serenity-js/compare/v2.25.4...v2.25.5) (2021-03-22)

**Note:** Version bump only for package @serenity-js/protractor





## [2.25.4](https://github.com/serenity-js/serenity-js/compare/v2.25.3...v2.25.4) (2021-03-21)


### Bug Fixes

* **deps:** updated dependencies ([32a41eb](https://github.com/serenity-js/serenity-js/commit/32a41eb8a8b4386b6b03111c1adf48e1e0aabdbb))





## [2.25.3](https://github.com/serenity-js/serenity-js/compare/v2.25.2...v2.25.3) (2021-03-20)

**Note:** Version bump only for package @serenity-js/protractor





## [2.25.2](https://github.com/serenity-js/serenity-js/compare/v2.25.1...v2.25.2) (2021-03-18)

**Note:** Version bump only for package @serenity-js/protractor





## [2.25.1](https://github.com/serenity-js/serenity-js/compare/v2.25.0...v2.25.1) (2021-03-17)


### Bug Fixes

* **protractor:** relaxed peerDependencies version range ([2542bf2](https://github.com/serenity-js/serenity-js/commit/2542bf2ef09216dc6ef8b8ac08395f6bf101d878))





# [2.25.0](https://github.com/serenity-js/serenity-js/compare/v2.24.1...v2.25.0) (2021-03-15)


### Bug Fixes

* **core:** moved RelativeQuestion interface to core and renamed to MetaQuestion ([fdc9500](https://github.com/serenity-js/serenity-js/commit/fdc9500d68509497d2a6036a5e416637f94b8632))
* **protractor:** added an explicit dependency on @serenity-js/assertions ([0d0dda3](https://github.com/serenity-js/serenity-js/commit/0d0dda3fc6d346eb3940e959b8a314e900ea27ed))
* **protractor:** deprecated experimental Pick; use Target.all().located().where(...) instead ([81b9c36](https://github.com/serenity-js/serenity-js/commit/81b9c36436421ac1f280bb501dde558f442c1ead))


### Features

* **core:** moved Expectation from @serenity-js/assertions to @serenity-js/core ([208391e](https://github.com/serenity-js/serenity-js/commit/208391e7b0f9dab177e0b5305e6b8fb2415cb7f4))
* **core:** new question List to help retrieve a specific item from a collection ([2de991a](https://github.com/serenity-js/serenity-js/commit/2de991a7ba893098cc999110678f6390b7101e03))
* **protractor:** new APIs to make it easier to pick a specific element from Target.all ([f697d39](https://github.com/serenity-js/serenity-js/commit/f697d3917db6185000911304d390df1f5163c27f))





## [2.24.1](https://github.com/serenity-js/serenity-js/compare/v2.24.0...v2.24.1) (2021-02-28)


### Bug Fixes

* **core:** corrected package.json to mention all the Node and NPM versions supported by Serenity/JS ([9fff39a](https://github.com/serenity-js/serenity-js/commit/9fff39a962ad6e75596e0c8e3f8534a67c20d001))





# [2.24.0](https://github.com/serenity-js/serenity-js/compare/v2.23.2...v2.24.0) (2021-02-26)


### Features

* **protractor:** protractor adapter merges `capability`-level test runner config with root config ([f8a830c](https://github.com/serenity-js/serenity-js/commit/f8a830c87908163527cc2104834ef02f025d1f7f)), closes [protractor-cucumber-framework/protractor-cucumber-framework#73](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/73)
* **protractor:** suppport for Cucumber no-strict mode ([5d13bd5](https://github.com/serenity-js/serenity-js/commit/5d13bd5c7d582e04d801c92d71db42836305516b)), closes [protractor-cucumber-framework/protractor-cucumber-framework#181](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/181)





## [2.23.2](https://github.com/serenity-js/serenity-js/compare/v2.23.1...v2.23.2) (2021-02-23)


### Bug Fixes

* **protractor:** optional Serenity/JS modules are marked as peerDependencies to avoid NPM installing them by default ([433afa1](https://github.com/serenity-js/serenity-js/commit/433afa1ab9d92635f14df50af6f0bf720e91c69e)), closes [npm/npm#3066](https://github.com/npm/npm/issues/3066)





## [2.23.1](https://github.com/serenity-js/serenity-js/compare/v2.23.0...v2.23.1) (2021-02-21)


### Bug Fixes

* **core:** refactored test runner adapters to introduce a common interface they all implement ([bf82e7c](https://github.com/serenity-js/serenity-js/commit/bf82e7c5c494f12cd9f372fa2e6bf9e432f0e14f))
* **protractor:** improved support for native Cucumber reporters ([2f4bdcf](https://github.com/serenity-js/serenity-js/commit/2f4bdcf35206b1f54bd19a0f7f84d4c3d0d34090)), closes [protractor-cucumber-framework/protractor-cucumber-framework#73](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/73)
* **protractor:** native Cucumber.js formatters print to unique output files when needed ([bfef775](https://github.com/serenity-js/serenity-js/commit/bfef775fefff9be9f92167459f603a44d4450642)), closes [protractor-cucumber-framework/protractor-cucumber-framework#73](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/73)





# [2.23.0](https://github.com/serenity-js/serenity-js/compare/v2.22.0...v2.23.0) (2021-02-16)


### Bug Fixes

* **protractor:** better error message when Navigate fails ([3f4bac7](https://github.com/serenity-js/serenity-js/commit/3f4bac79b57976cabb27bd23712e2f096484c02b))
* **protractor:** fixed potential synchronisation issue in Select ([fb451c7](https://github.com/serenity-js/serenity-js/commit/fb451c731e0553220003c70c8695d36856e6a500))
* **protractor:** improved support for native Cucumber.js reporters on Windows ([ced153c](https://github.com/serenity-js/serenity-js/commit/ced153cbbcad6fd061adf4c1c84a4d60211a4cd3)), closes [protractor-cucumber-framework/protractor-cucumber-framework#73](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/73)


### Features

* **protractor:** Serenity/JS Cucumber adapter supports native Cucumber.js reporters ([bbf00c0](https://github.com/serenity-js/serenity-js/commit/bbf00c0a22e8d788b4c84c3d3bc94338f675e7cc)), closes [protractor-cucumber-framework/protractor-cucumber-framework#73](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/73)





# [2.22.0](https://github.com/serenity-js/serenity-js/compare/v2.21.0...v2.22.0) (2021-01-27)

**Note:** Version bump only for package @serenity-js/protractor





# [2.21.0](https://github.com/serenity-js/serenity-js/compare/v2.20.1...v2.21.0) (2021-01-26)


### Features

* **core:** event TestRunStarts is now emitted before the first scenario starts ([fd30d39](https://github.com/serenity-js/serenity-js/commit/fd30d393831e9ed80c9f9b63edc863b8ae779de5))
* **core:** SceneFinishes informs StageCrewMembers about the Outcome of the scenario ([abfca70](https://github.com/serenity-js/serenity-js/commit/abfca70e91633c068617d8d273a302aaab692265))





## [2.20.1](https://github.com/serenity-js/serenity-js/compare/v2.20.0...v2.20.1) (2021-01-23)


### Bug Fixes

* **deps:** updated tiny-types ([e81a6ea](https://github.com/serenity-js/serenity-js/commit/e81a6ea804286083da118f9141ebbfd52746b581))





# [2.20.0](https://github.com/serenity-js/serenity-js/compare/v2.19.10...v2.20.0) (2021-01-18)

**Note:** Version bump only for package @serenity-js/protractor





## [2.19.10](https://github.com/serenity-js/serenity-js/compare/v2.19.9...v2.19.10) (2020-12-22)

**Note:** Version bump only for package @serenity-js/protractor





## [2.19.9](https://github.com/serenity-js/serenity-js/compare/v2.19.8...v2.19.9) (2020-12-15)

**Note:** Version bump only for package @serenity-js/protractor





## [2.19.8](https://github.com/serenity-js/serenity-js/compare/v2.19.7...v2.19.8) (2020-12-15)


### Bug Fixes

* **core:** serenity-js/core is now a direct dependency of all the Serenity/JS modules ([4561862](https://github.com/serenity-js/serenity-js/commit/45618629c319041eedc0a64174d2b342fffadfa4))





## [2.19.7](https://github.com/serenity-js/serenity-js/compare/v2.19.6...v2.19.7) (2020-12-10)

**Note:** Version bump only for package @serenity-js/protractor





## 2.19.6 (2020-12-10)

**Note:** Version bump only for package @serenity-js/protractor





## 2.19.5 (2020-12-10)

**Note:** Version bump only for package @serenity-js/protractor





## 2.19.4 (2020-11-30)


### Bug Fixes

* **protractor:** improved the description of the ProtractorParam question ([e9e1cae](https://github.com/serenity-js/serenity-js/commit/e9e1caef0b726e1060d1766bce6cf7a9396e118c))





## 2.19.3 (2020-11-26)

**Note:** Version bump only for package @serenity-js/protractor





## 2.19.2 (2020-11-26)

**Note:** Version bump only for package @serenity-js/protractor





## 2.19.1 (2020-11-25)


### Bug Fixes

* **deps:** updated dependencies ([25e316d](https://github.com/serenity-js/serenity-js/commit/25e316d8d5db2e9c9e44914d2017a2b004cb6eb7))





# 2.19.0 (2020-11-25)


### Features

* **protractor:** EXPERIMENTAL: Custom extensions can be mixed into BrowseTheWeb ([3b26baa](https://github.com/serenity-js/serenity-js/commit/3b26baab1f2c2108648d2c3093e69326aaa1dfc4))





## 2.18.2 (2020-11-22)


### Bug Fixes

* **core:** better support for abilities that are discarded asynchronously ([fb130b6](https://github.com/serenity-js/serenity-js/commit/fb130b626074337735f944308db4982c30824485))





## 2.18.1 (2020-11-21)

**Note:** Version bump only for package @serenity-js/protractor





# 2.18.0 (2020-11-17)


### Features

* **core:** Cross-scenario Actors + improved Ability lifecycle management (version bump) ([5f30cc2](https://github.com/serenity-js/serenity-js/commit/5f30cc2583e706f1527f47dee265fe570603e9a6))





## 2.17.16 (2020-11-17)

**Note:** Version bump only for package @serenity-js/protractor





## 2.17.15 (2020-11-14)

**Note:** Version bump only for package @serenity-js/protractor





## 2.17.14 (2020-11-14)

**Note:** Version bump only for package @serenity-js/protractor





## 2.17.13 (2020-11-14)

**Note:** Version bump only for package @serenity-js/protractor





## 2.17.12 (2020-11-14)


### Bug Fixes

* **deps:** updated dependencies ([0b5abc7](https://github.com/serenity-js/serenity-js/commit/0b5abc7f4a9f026d49691e844315e1ba8677c282))





## 2.17.11 (2020-11-14)

**Note:** Version bump only for package @serenity-js/protractor





## 2.17.10 (2020-11-06)

**Note:** Version bump only for package @serenity-js/protractor





## 2.17.9 (2020-11-06)

**Note:** Version bump only for package @serenity-js/protractor





## 2.17.8 (2020-11-06)

**Note:** Version bump only for package @serenity-js/protractor





## 2.17.7 (2020-11-06)

**Note:** Version bump only for package @serenity-js/protractor





## 2.17.6 (2020-11-06)

**Note:** Version bump only for package @serenity-js/protractor





## [2.17.5](https://github.com/serenity-js/serenity-js/compare/v2.17.4...v2.17.5) (2020-11-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.17.4](https://github.com/serenity-js/serenity-js/compare/v2.17.3...v2.17.4) (2020-10-28)

**Note:** Version bump only for package @serenity-js/protractor





## [2.17.3](https://github.com/serenity-js/serenity-js/compare/v2.17.2...v2.17.3) (2020-10-25)


### Bug Fixes

* **protractor:** presence of modal dialog windows will no longer impact the Photographer ([eedae92](https://github.com/serenity-js/serenity-js/commit/eedae92da3d172f97290696edc5ad6ca21903b00)), closes [#532](https://github.com/serenity-js/serenity-js/issues/532)





## [2.17.2](https://github.com/serenity-js/serenity-js/compare/v2.17.1...v2.17.2) (2020-10-24)


### Bug Fixes

* **core:** all Activity-related events can be correlated with the Scene they originate from ([6cf0eca](https://github.com/serenity-js/serenity-js/commit/6cf0eca7670db01ac317587996fc3ea5984de059))
* **core:** it's easier for reporters to associate artifacts with scenes they've originated from ([1ccdc99](https://github.com/serenity-js/serenity-js/commit/1ccdc998af4049d6c91dc263b16a7d8c7d84bbfa))
* **core:** refactored the internal domain events so that they're easier to aggregate and correlate ([943c016](https://github.com/serenity-js/serenity-js/commit/943c016ed3e404c9c1aacf8342e42626d4d85d04))
* **protractor:** photographer ignores closed browser windows ([8991f07](https://github.com/serenity-js/serenity-js/commit/8991f07d8238ad91763eadc42ba7688c0da83b04)), closes [#680](https://github.com/serenity-js/serenity-js/issues/680) [#506](https://github.com/serenity-js/serenity-js/issues/506)





## [2.17.1](https://github.com/serenity-js/serenity-js/compare/v2.17.0...v2.17.1) (2020-10-08)


### Bug Fixes

* **core:** improved ErrorSerialiser so that it works with cyclic data structures ([9309302](https://github.com/serenity-js/serenity-js/commit/9309302d0ca7ec4bc27e414813a18c301cf3ef02))





# [2.17.0](https://github.com/serenity-js/serenity-js/compare/v2.16.0...v2.17.0) (2020-10-05)


### Bug Fixes

* **protractor:** documentation and examples for all the interactions ([39a175d](https://github.com/serenity-js/serenity-js/commit/39a175d7139d6733748dcce317196794042b6a36))


### Features

* **protractor:** interactions to Close browser windows and Switch between (i)frames and windows ([2ec64ef](https://github.com/serenity-js/serenity-js/commit/2ec64ef63884b47a6b9380fcac18f2936ad611fc)), closes [#66](https://github.com/serenity-js/serenity-js/issues/66) [#82](https://github.com/serenity-js/serenity-js/issues/82) [#227](https://github.com/serenity-js/serenity-js/issues/227) [#233](https://github.com/serenity-js/serenity-js/issues/233) [#366](https://github.com/serenity-js/serenity-js/issues/366)





# [2.16.0](https://github.com/serenity-js/serenity-js/compare/v2.15.0...v2.16.0) (2020-09-20)


### Features

* **core:** Question#map() and mapping functions for Answerable<string> ([e5bb825](https://github.com/serenity-js/serenity-js/commit/e5bb82548f399557387cb24028bb9c8dd1dd5393))
* **core:** the name of a Question's subject can be overridden ([8ec5ab7](https://github.com/serenity-js/serenity-js/commit/8ec5ab7c901a395a81d2ee5db0c653b163a586a7))





# [2.15.0](https://github.com/serenity-js/serenity-js/compare/v2.14.0...v2.15.0) (2020-08-27)


### Features

* **core:** an interaction to Loop.over an Answerable<Array<T>> ([ded7dc2](https://github.com/serenity-js/serenity-js/commit/ded7dc252609e1c9caf67c92784c82cfc3dbeaa5))





# [2.14.0](https://github.com/serenity-js/serenity-js/compare/v2.13.1...v2.14.0) (2020-08-17)


### Features

* **protractor:** better API for Select.options and Select.values ([3331f57](https://github.com/serenity-js/serenity-js/commit/3331f578cbfd4d29d0a1925633863113495f2a62)), closes [#373](https://github.com/serenity-js/serenity-js/issues/373)
* **protractor:** interactions to Select and questions about Selected ([f0a7812](https://github.com/serenity-js/serenity-js/commit/f0a78127a7038b5734789f8b4b4d1df2444f154d)), closes [#373](https://github.com/serenity-js/serenity-js/issues/373)





## [2.13.1](https://github.com/serenity-js/serenity-js/compare/v2.13.0...v2.13.1) (2020-08-05)

**Note:** Version bump only for package @serenity-js/protractor





# [2.13.0](https://github.com/serenity-js/serenity-js/compare/v2.12.3...v2.13.0) (2020-07-25)


### Features

* **protractor:** support for handling modal dialog windows ([2dfb44c](https://github.com/serenity-js/serenity-js/commit/2dfb44c5e3761be47e11528c3485fedf2600924f)), closes [#374](https://github.com/serenity-js/serenity-js/issues/374)





## [2.12.3](https://github.com/serenity-js/serenity-js/compare/v2.12.2...v2.12.3) (2020-07-14)


### Bug Fixes

* **protractor:** `Clear` can clear a value of an empty field ([6bd85ff](https://github.com/serenity-js/serenity-js/commit/6bd85ffc4d4a5169652cb8d1a5d743e47e9efcc2))





## [2.12.2](https://github.com/serenity-js/serenity-js/compare/v2.12.1...v2.12.2) (2020-07-08)

**Note:** Version bump only for package @serenity-js/protractor





## [2.12.1](https://github.com/serenity-js/serenity-js/compare/v2.12.0...v2.12.1) (2020-07-07)

**Note:** Version bump only for package @serenity-js/protractor





# [2.12.0](https://github.com/serenity-js/serenity-js/compare/v2.11.4...v2.12.0) (2020-07-06)

**Note:** Version bump only for package @serenity-js/protractor





## [2.11.4](https://github.com/serenity-js/serenity-js/compare/v2.11.3...v2.11.4) (2020-07-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.11.3](https://github.com/serenity-js/serenity-js/compare/v2.11.2...v2.11.3) (2020-07-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.11.2](https://github.com/serenity-js/serenity-js/compare/v2.11.1...v2.11.2) (2020-07-04)

**Note:** Version bump only for package @serenity-js/protractor





## [2.11.1](https://github.com/serenity-js/serenity-js/compare/v2.11.0...v2.11.1) (2020-06-30)

**Note:** Version bump only for package @serenity-js/protractor





# [2.11.0](https://github.com/serenity-js/serenity-js/compare/v2.10.3...v2.11.0) (2020-06-20)


### Bug Fixes

* **docs:** documented changes to Target.of in the Serenity/JS 2.0 upgrade guide ([43bec7b](https://github.com/serenity-js/serenity-js/commit/43bec7b86d16f977bcd059d271cae76bab81171d)), closes [#598](https://github.com/serenity-js/serenity-js/issues/598)


### Features

* **mocha:** support for retrying failed scenarios ([2ff755b](https://github.com/serenity-js/serenity-js/commit/2ff755b4fa395ae412f4b250c3ba924a1337438c)), closes [#101](https://github.com/serenity-js/serenity-js/issues/101)
* **protractor:** support for using Mocha with Protractor ([ae5bd7e](https://github.com/serenity-js/serenity-js/commit/ae5bd7efe780894c07451edec030d156c16aa8fa))





## [2.10.3](https://github.com/serenity-js/serenity-js/compare/v2.10.2...v2.10.3) (2020-06-15)

**Note:** Version bump only for package @serenity-js/protractor





## [2.10.2](https://github.com/serenity-js/serenity-js/compare/v2.10.1...v2.10.2) (2020-06-11)

**Note:** Version bump only for package @serenity-js/protractor





## [2.10.1](https://github.com/serenity-js/serenity-js/compare/v2.10.0...v2.10.1) (2020-06-10)


### Bug Fixes

* **docs:** documented Cucumber configuration better ([04ed39a](https://github.com/serenity-js/serenity-js/commit/04ed39a9d0902da9ab94c938e83a7e021377e678))
* **protractor:** photographer will not try to capture the screenshot if the actor has no browser ([f1491bf](https://github.com/serenity-js/serenity-js/commit/f1491bf979732c56d1b0f3734bad2c33106b0748))





# [2.10.0](https://github.com/serenity-js/serenity-js/compare/v2.9.0...v2.10.0) (2020-06-06)

**Note:** Version bump only for package @serenity-js/protractor





# [2.7.0](https://github.com/serenity-js/serenity-js/compare/v2.6.0...v2.7.0) (2020-06-01)

**Note:** Version bump only for package @serenity-js/protractor





# [2.6.0](https://github.com/serenity-js/serenity-js/compare/v2.5.5...v2.6.0) (2020-05-27)

**Note:** Version bump only for package @serenity-js/protractor





## [2.5.5](https://github.com/serenity-js/serenity-js/compare/v2.5.4...v2.5.5) (2020-05-25)

**Note:** Version bump only for package @serenity-js/protractor





## [2.5.4](https://github.com/serenity-js/serenity-js/compare/v2.5.3...v2.5.4) (2020-05-22)

**Note:** Version bump only for package @serenity-js/protractor





## [2.5.3](https://github.com/serenity-js/serenity-js/compare/v2.5.2...v2.5.3) (2020-05-21)

**Note:** Version bump only for package @serenity-js/protractor





## [2.5.2](https://github.com/serenity-js/serenity-js/compare/v2.5.1...v2.5.2) (2020-05-16)

**Note:** Version bump only for package @serenity-js/protractor





## [2.5.1](https://github.com/serenity-js/serenity-js/compare/v2.5.0...v2.5.1) (2020-05-16)


### Bug Fixes

* **protractor:** support for Protractor 7.0.0 ([cf7518a](https://github.com/serenity-js/serenity-js/commit/cf7518a848e0204b67c1ebeb3b8e2200cd0a6ad8))





# [2.5.0](https://github.com/serenity-js/serenity-js/compare/v2.4.1...v2.5.0) (2020-05-14)


### Bug Fixes

* **npm:** esport ES2018 instead of ES5 since we're supporting Node >= 10 ([a77091a](https://github.com/serenity-js/serenity-js/commit/a77091aa779736172a60b6ac99ec1b869aaea816))





## [2.4.1](https://github.com/serenity-js/serenity-js/compare/v2.4.0...v2.4.1) (2020-05-03)

**Note:** Version bump only for package @serenity-js/protractor





# [2.4.0](https://github.com/serenity-js/serenity-js/compare/v2.3.6...v2.4.0) (2020-05-02)


### Features

* **protractor:** navigate.to(url).withTimeout(duration) ([be23c6e](https://github.com/serenity-js/serenity-js/commit/be23c6e4f2a00edad01a9c9ecc1734ec2eda4f4a)), closes [#517](https://github.com/serenity-js/serenity-js/issues/517)





## [2.3.6](https://github.com/serenity-js/serenity-js/compare/v2.3.5...v2.3.6) (2020-04-28)

**Note:** Version bump only for package @serenity-js/protractor





## [2.3.5](https://github.com/serenity-js/serenity-js/compare/v2.3.4...v2.3.5) (2020-04-28)

**Note:** Version bump only for package @serenity-js/protractor





## [2.3.4](https://github.com/serenity-js/serenity-js/compare/v2.3.3...v2.3.4) (2020-04-22)

**Note:** Version bump only for package @serenity-js/protractor





## [2.3.3](https://github.com/serenity-js/serenity-js/compare/v2.3.2...v2.3.3) (2020-04-22)


### Bug Fixes

* **protractor:** cleaned up the API docs and introduced interfaces to simplify method signatures ([8e85a54](https://github.com/serenity-js/serenity-js/commit/8e85a54452dfb79ca04d94fa1d81e295be2be3ae))





## [2.3.2](https://github.com/serenity-js/serenity-js/compare/v2.3.1...v2.3.2) (2020-04-08)


### Bug Fixes

* **deps:** updated TSLint and fixed some minor code style issues ([f43fd14](https://github.com/serenity-js/serenity-js/commit/f43fd14e11e2582aaa0d7cb3c186e0a58874a7fc))





## [2.3.1](https://github.com/serenity-js/serenity-js/compare/v2.3.0...v2.3.1) (2020-04-07)


### Bug Fixes

* **deps:** updated dependencies ([67401a7](https://github.com/serenity-js/serenity-js/commit/67401a774582386be02178e077b918a481630950))





## [2.2.2](https://github.com/serenity-js/serenity-js/compare/v2.2.1...v2.2.2) (2020-03-08)

**Note:** Version bump only for package @serenity-js/protractor





## [2.2.1](https://github.com/serenity-js/serenity-js/compare/v2.2.0...v2.2.1) (2020-03-04)

**Note:** Version bump only for package @serenity-js/protractor





# [2.2.0](https://github.com/serenity-js/serenity-js/compare/v2.1.5...v2.2.0) (2020-02-17)


### Features

* **protractor:** expectation to check if an element isActive() ([bb7f6c5](https://github.com/serenity-js/serenity-js/commit/bb7f6c58e481b37793123ce0ba2ff1177240ba8b))





## [2.1.5](https://github.com/serenity-js/serenity-js/compare/v2.1.4...v2.1.5) (2020-02-10)

**Note:** Version bump only for package @serenity-js/protractor





## [2.1.4](https://github.com/serenity-js/serenity-js/compare/v2.1.3...v2.1.4) (2020-02-10)

**Note:** Version bump only for package @serenity-js/protractor





## [2.1.3](https://github.com/serenity-js/serenity-js/compare/v2.1.2...v2.1.3) (2020-02-10)

**Note:** Version bump only for package @serenity-js/protractor





## [2.1.2](https://github.com/serenity-js/serenity-js/compare/v2.1.1...v2.1.2) (2020-02-08)


### Bug Fixes

* **protractor:** distinguish between regular and 'mobile emulation' test runs ([fcd7101](https://github.com/serenity-js/serenity-js/commit/fcd7101939fddd855f45aa99b75e309b382b6b73)), closes [#323](https://github.com/serenity-js/serenity-js/issues/323)





## [2.1.1](https://github.com/serenity-js/serenity-js/compare/v2.1.0...v2.1.1) (2020-02-08)


### Bug Fixes

* **protractor:** detect the browser name and version, as well as the platform name and version ([9965918](https://github.com/serenity-js/serenity-js/commit/99659187b99bb2d97f8cc51910a4f12f2685875c)), closes [#455](https://github.com/serenity-js/serenity-js/issues/455)





# [2.1.0](https://github.com/serenity-js/serenity-js/compare/v2.0.9...v2.1.0) (2020-02-07)


### Features

* **protractor:** browser tags include browser version and platform name ([bc4a038](https://github.com/serenity-js/serenity-js/commit/bc4a038484f75e90e44c5399c43213b472e71f38)), closes [#132](https://github.com/serenity-js/serenity-js/issues/132)





## [2.0.7](https://github.com/serenity-js/serenity-js/compare/v2.0.6...v2.0.7) (2020-02-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.6](https://github.com/serenity-js/serenity-js/compare/v2.0.5...v2.0.6) (2020-02-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.4](https://github.com/serenity-js/serenity-js/compare/v2.0.3...v2.0.4) (2020-02-04)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.3](https://github.com/serenity-js/serenity-js/compare/v2.0.2...v2.0.3) (2020-02-04)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.2](https://github.com/serenity-js/serenity-js/compare/v2.0.1...v2.0.2) (2020-02-04)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.132...v2.0.1) (2020-02-03)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.132](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.131...v2.0.1-alpha.132) (2020-02-03)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.131](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.130...v2.0.1-alpha.131) (2020-02-03)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.130](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.129...v2.0.1-alpha.130) (2020-02-03)


### Bug Fixes

* **protractor:** updated dev dependency on Protractor ([736bf54](https://github.com/serenity-js/serenity-js/commit/736bf54aea5d79eaec5dd1e8e9a70d2fbaa035ce))





## [2.0.1-alpha.129](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.128...v2.0.1-alpha.129) (2020-02-02)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.127](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.126...v2.0.1-alpha.127) (2020-02-02)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.126](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.125...v2.0.1-alpha.126) (2020-02-02)


### Bug Fixes

* **npm:** corrected the repo URL after the jan-molak -> serenity-js repo  migration ([a451199](https://github.com/serenity-js/serenity-js/commit/a4511995c50bf08977aa6c4c0f5d22ba7ead343f))





## [2.0.1-alpha.119](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.118...v2.0.1-alpha.119) (2020-02-02)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.118](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.117...v2.0.1-alpha.118) (2020-02-01)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.117](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.116...v2.0.1-alpha.117) (2020-01-29)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.116](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.115...v2.0.1-alpha.116) (2020-01-29)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.115](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.114...v2.0.1-alpha.115) (2020-01-27)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.114](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.113...v2.0.1-alpha.114) (2020-01-27)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.113](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.112...v2.0.1-alpha.113) (2020-01-26)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.112](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.111...v2.0.1-alpha.112) (2020-01-25)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.111](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.110...v2.0.1-alpha.111) (2020-01-25)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.110](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.109...v2.0.1-alpha.110) (2020-01-25)


### Features

* **core:** new APIs to make configuring and using Serenity/JS easier ([d11a80d](https://github.com/jan-molak/serenity-js/commit/d11a80de66519cb16b6eaa61a39694006a76b5fb))





## [2.0.1-alpha.109](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.108...v2.0.1-alpha.109) (2020-01-23)


### Bug Fixes

* **jasmine:** corrected synchronisation of async events ([38fd1c7](https://github.com/jan-molak/serenity-js/commit/38fd1c7ad5fc8396a8c2a4e9a68286cac7f033f7)), closes [#405](https://github.com/jan-molak/serenity-js/issues/405)





## [2.0.1-alpha.108](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.107...v2.0.1-alpha.108) (2020-01-20)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.107](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.106...v2.0.1-alpha.107) (2020-01-19)


### Bug Fixes

* **protractor:** support restarting the browser between test scenarios ([21b5a41](https://github.com/jan-molak/serenity-js/commit/21b5a4187dbbc9babf70e75cda8b42e5e2531d17))





## [2.0.1-alpha.106](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.105...v2.0.1-alpha.106) (2020-01-19)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.105](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.104...v2.0.1-alpha.105) (2020-01-16)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.104](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.104) (2020-01-10)


### Bug Fixes

* **lerna:** fixed the versions, since lerna managed to mess them up again ([0e87048](https://github.com/jan-molak/serenity-js/commit/0e87048219dc17a0c64a1bbf6b12128b18e85718))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.102...v2.0.1-alpha.103) (2020-01-10)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.102](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.101...v2.0.1-alpha.102) (2020-01-10)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.101](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.100...v2.0.1-alpha.101) (2020-01-09)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.100](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.99...v2.0.1-alpha.100) (2020-01-09)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.99](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.98...v2.0.1-alpha.99) (2020-01-09)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.98](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.97...v2.0.1-alpha.98) (2019-12-16)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.97](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.96...v2.0.1-alpha.97) (2019-12-15)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.96](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.95...v2.0.1-alpha.96) (2019-12-15)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.95](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.94...v2.0.1-alpha.95) (2019-12-11)


### Bug Fixes

* **dependencies:** updated Lerna and corrected the versions that got out of sync ([6c2f3af](https://github.com/jan-molak/serenity-js/commit/6c2f3afe98207c9241b5a7df970ec94fa37f4f1d))





## [2.0.1-alpha.94](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.93...v2.0.1-alpha.94) (2019-12-11)


### Bug Fixes

* **protractor:** updated the version of Chromedriver ([f1c6a57](https://github.com/jan-molak/serenity-js/commit/f1c6a57))





## [2.0.1-alpha.92](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.91...v2.0.1-alpha.92) (2019-12-09)


### Features

* **protractor:** Support for resizing the browser window ([42ca75d](https://github.com/jan-molak/serenity-js/commit/42ca75d))





## [2.0.1-alpha.90](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.89...v2.0.1-alpha.90) (2019-11-29)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.89](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.88...v2.0.1-alpha.89) (2019-11-27)


### Bug Fixes

* **protractor:** Corrected the test runner detector ([e5e638b](https://github.com/jan-molak/serenity-js/commit/e5e638b))





## [2.0.1-alpha.88](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.87...v2.0.1-alpha.88) (2019-11-25)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.87](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.86...v2.0.1-alpha.87) (2019-11-10)


### Bug Fixes

* **protractor:** Names of artifacts produced during the test run are easier to distinguish ([da91e93](https://github.com/jan-molak/serenity-js/commit/da91e93)), closes [#132](https://github.com/jan-molak/serenity-js/issues/132)





## [2.0.1-alpha.86](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.85...v2.0.1-alpha.86) (2019-11-09)


### Features

* **protractor:** TakeScreenshot allows the actor to capture screenshots at any point during the sce ([1d07075](https://github.com/jan-molak/serenity-js/commit/1d07075))





## [2.0.1-alpha.85](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.84...v2.0.1-alpha.85) (2019-10-13)


### Bug Fixes

* **core:** Dropped support for node 6 ([74d1ece](https://github.com/jan-molak/serenity-js/commit/74d1ece))





## [2.0.1-alpha.84](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.83...v2.0.1-alpha.84) (2019-09-24)


### Bug Fixes

* **protractor:** The Clear interaction willl complain if used with an element that cannot be cleared ([f7908a8](https://github.com/jan-molak/serenity-js/commit/f7908a8))





## [2.0.1-alpha.83](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.82...v2.0.1-alpha.83) (2019-09-23)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.82](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.81...v2.0.1-alpha.82) (2019-09-22)


### Bug Fixes

* **protractor:** Added an interaction to Hover.over(target), corrected the DoubleClick interaction s ([13e480f](https://github.com/jan-molak/serenity-js/commit/13e480f))





## [2.0.1-alpha.81](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.80...v2.0.1-alpha.81) (2019-09-16)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.80](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.79...v2.0.1-alpha.80) (2019-09-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.77](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.76...v2.0.1-alpha.77) (2019-09-01)


### Features

* **protractor:** Photographer.whoWill(..) factory method to make instantiation of the Photographer ([2880116](https://github.com/jan-molak/serenity-js/commit/2880116)), closes [#335](https://github.com/jan-molak/serenity-js/issues/335)





## [2.0.1-alpha.76](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.75...v2.0.1-alpha.76) (2019-08-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.75](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.74...v2.0.1-alpha.75) (2019-07-16)


### Features

* **protractor:** Wait.until(expectation) fails with an AssertionError if the expectation is not met ([bfff8d6](https://github.com/jan-molak/serenity-js/commit/bfff8d6))





## [2.0.1-alpha.74](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.73...v2.0.1-alpha.74) (2019-07-07)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.73](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.72...v2.0.1-alpha.73) (2019-06-24)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.72](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.71...v2.0.1-alpha.72) (2019-06-23)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.71](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.70...v2.0.1-alpha.71) (2019-06-23)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.70](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.69...v2.0.1-alpha.70) (2019-06-22)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.69](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.68...v2.0.1-alpha.69) (2019-06-20)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.68](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.67...v2.0.1-alpha.68) (2019-05-28)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.67](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.66...v2.0.1-alpha.67) (2019-05-27)


### Features

* **protractor:** Jasmine adapter for Protractor ([97bf841](https://github.com/jan-molak/serenity-js/commit/97bf841))





## [2.0.1-alpha.66](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.65...v2.0.1-alpha.66) (2019-05-23)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.65](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.64...v2.0.1-alpha.65) (2019-05-14)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.64](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.63...v2.0.1-alpha.64) (2019-05-02)


### Bug Fixes

* **core:** StageCrewMembers are now exported directly from @serenity-js/core ([e476d53](https://github.com/jan-molak/serenity-js/commit/e476d53))





## [2.0.1-alpha.63](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.62...v2.0.1-alpha.63) (2019-05-01)


### Features

* **assertions:** Expectation aliases via Expectation.to(description).soThatActual(expectation) ([d4b8c48](https://github.com/jan-molak/serenity-js/commit/d4b8c48))





## [2.0.1-alpha.62](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.61...v2.0.1-alpha.62) (2019-05-01)


### Features

* **protractor:** Report directory can be configured in protractor.conf.js ([e46f7ec](https://github.com/jan-molak/serenity-js/commit/e46f7ec)), closes [#45](https://github.com/jan-molak/serenity-js/issues/45)





## [2.0.1-alpha.61](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.60...v2.0.1-alpha.61) (2019-04-29)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.60](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.59...v2.0.1-alpha.60) (2019-04-29)


### Features

* **protractor:** Browser.log() allows the actor to read the browser log entries ([2a088b7](https://github.com/jan-molak/serenity-js/commit/2a088b7))





## [2.0.1-alpha.59](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.58...v2.0.1-alpha.59) (2019-04-29)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.58](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.57...v2.0.1-alpha.58) (2019-04-26)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.57](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.56...v2.0.1-alpha.57) (2019-04-25)


### Bug Fixes

* **ci:** Corrected the version numbers ([5e97d35](https://github.com/jan-molak/serenity-js/commit/5e97d35))





## [2.0.1-alpha.56](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.55...v2.0.1-alpha.56) (2019-04-25)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.55](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.54...v2.0.1-alpha.55) (2019-04-25)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.54](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.53...v2.0.1-alpha.54) (2019-04-24)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.53](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.52...v2.0.1-alpha.53) (2019-04-24)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.52](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.51...v2.0.1-alpha.52) (2019-04-24)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.51](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.50...v2.0.1-alpha.51) (2019-04-23)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.50](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.49...v2.0.1-alpha.50) (2019-04-18)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.49](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.48...v2.0.1-alpha.49) (2019-04-17)


### Features

* **protractor:** ProtractorFrameworkAdapter for Cucumber ([7474dbb](https://github.com/jan-molak/serenity-js/commit/7474dbb))





## [2.0.1-alpha.48](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.47...v2.0.1-alpha.48) (2019-04-11)


### Bug Fixes

* **core:** Corrected the RuntimeError class so that the name of the constructor is present in the st ([0d2164d](https://github.com/jan-molak/serenity-js/commit/0d2164d))


### Features

* **protractor:** Support for testing cookies ([15e043b](https://github.com/jan-molak/serenity-js/commit/15e043b))





## [2.0.1-alpha.47](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.46...v2.0.1-alpha.47) (2019-04-07)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.46](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.45...v2.0.1-alpha.46) (2019-04-05)


### Bug Fixes

* **core:** Reverted the peerDependencies change as Lerna can't support it ([e27f55f](https://github.com/jan-molak/serenity-js/commit/e27f55f))





## [2.0.1-alpha.45](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.44...v2.0.1-alpha.45) (2019-04-05)


### Bug Fixes

* **core:** Made all [@serenity-js](https://github.com/serenity-js) packages rely on a fixed version of [@serenity-js](https://github.com/serenity-js)/core ([9955a34](https://github.com/jan-molak/serenity-js/commit/9955a34))





## [2.0.1-alpha.44](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.43...v2.0.1-alpha.44) (2019-04-04)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.43](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.42...v2.0.1-alpha.43) (2019-04-01)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.42](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.41...v2.0.1-alpha.42) (2019-03-29)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.41](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.40...v2.0.1-alpha.41) (2019-03-28)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.40](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.39...v2.0.1-alpha.40) (2019-03-26)


### Bug Fixes

* **protractor:** Correctly correlate screenshots with activities they are concerning ([f71ea88](https://github.com/jan-molak/serenity-js/commit/f71ea88))





## [2.0.1-alpha.39](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.38...v2.0.1-alpha.39) (2019-03-26)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.38](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.37...v2.0.1-alpha.38) (2019-03-25)


### Features

* **protractor:** Photo taking strategies for the Photographer ([8f6d149](https://github.com/jan-molak/serenity-js/commit/8f6d149))





## [2.0.1-alpha.37](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.36...v2.0.1-alpha.37) (2019-03-25)


### Bug Fixes

* **core:** All interactions extend Interaction rather than implement it to ensure they're correctly ([cef97af](https://github.com/jan-molak/serenity-js/commit/cef97af))





## [2.0.1-alpha.36](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.35...v2.0.1-alpha.36) (2019-03-25)


### Features

* **protractor:** Photographer takes screenshots when an Interaction fails ([5ad6468](https://github.com/jan-molak/serenity-js/commit/5ad6468))





## [2.0.1-alpha.35](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.34...v2.0.1-alpha.35) (2019-03-20)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.34](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.33...v2.0.1-alpha.34) (2019-03-18)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.33](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.32...v2.0.1-alpha.33) (2019-03-14)


### Bug Fixes

* **protractor:** Corrected the interface of LastScriptExecution.result ([09ccdb0](https://github.com/jan-molak/serenity-js/commit/09ccdb0))





## [2.0.1-alpha.32](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.31...v2.0.1-alpha.32) (2019-03-13)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.31](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.30...v2.0.1-alpha.31) (2019-03-07)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.30](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.29...v2.0.1-alpha.30) (2019-03-07)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.29](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.28...v2.0.1-alpha.29) (2019-03-06)


### Features

* **protractor:** UseAngular.disableSynchronisation and enableSynchronisation ([0d420c5](https://github.com/jan-molak/serenity-js/commit/0d420c5))





## [2.0.1-alpha.28](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.27...v2.0.1-alpha.28) (2019-03-06)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.27](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.26...v2.0.1-alpha.27) (2019-03-05)


### Features

* **protractor:** Scroll.to interaction ([9d20924](https://github.com/jan-molak/serenity-js/commit/9d20924))





## [2.0.1-alpha.26](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.25...v2.0.1-alpha.26) (2019-03-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.25](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.24...v2.0.1-alpha.25) (2019-03-04)


### Features

* **protractor:** LastScriptExecution.result() gives access to the value returned by the script pass ([75acc79](https://github.com/jan-molak/serenity-js/commit/75acc79))





## [2.0.1-alpha.24](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.23...v2.0.1-alpha.24) (2019-03-02)


### Bug Fixes

* **protractor:** `target` package renamed to `targets` so that it's correctly included in git and np ([0d1ea52](https://github.com/jan-molak/serenity-js/commit/0d1ea52))





## [2.0.1-alpha.23](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.22...v2.0.1-alpha.23) (2019-03-02)


### Bug Fixes

* **protractor:** Corrected the signatures of factory methods on Target to allow nesting of targets ([c4efd31](https://github.com/jan-molak/serenity-js/commit/c4efd31))


### Features

* **protractor:** ExecuteScript interactions and cleanup of the package structure ([753d511](https://github.com/jan-molak/serenity-js/commit/753d511))





## [2.0.1-alpha.22](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.21...v2.0.1-alpha.22) (2019-02-27)


### Bug Fixes

* **protractor:** Ensure Protractor ElementFinder is never wrapped in a promise as that makes it fail ([c7994dd](https://github.com/jan-molak/serenity-js/commit/c7994dd))


### Features

* **protractor:** Nestable Targets, relative Questions and improvements to Pick ([56ea633](https://github.com/jan-molak/serenity-js/commit/56ea633))





## [2.0.1-alpha.21](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.20...v2.0.1-alpha.21) (2019-02-21)


### Features

* **protractor:** Pick can be used with protractor questions and interactions ([6f7c5bd](https://github.com/jan-molak/serenity-js/commit/6f7c5bd))





## [2.0.1-alpha.20](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.19...v2.0.1-alpha.20) (2019-02-19)


### Features

* **protractor:** Targets can be nested within one another ([b8f95c8](https://github.com/jan-molak/serenity-js/commit/b8f95c8)), closes [#187](https://github.com/jan-molak/serenity-js/issues/187) [#143](https://github.com/jan-molak/serenity-js/issues/143)





## [2.0.1-alpha.19](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.18...v2.0.1-alpha.19) (2019-02-14)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.18](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.17...v2.0.1-alpha.18) (2019-02-14)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.17](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.16...v2.0.1-alpha.17) (2019-02-13)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.16](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.15...v2.0.1-alpha.16) (2019-02-13)


### Bug Fixes

* **protractor:** Navigate.to accepts a KnowableUnknown<string> ([a1847b7](https://github.com/jan-molak/serenity-js/commit/a1847b7))





## [2.0.1-alpha.15](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.14...v2.0.1-alpha.15) (2019-02-13)


### Features

* **protractor:** Press.the(key).into(field) interaction ([44a97b2](https://github.com/jan-molak/serenity-js/commit/44a97b2))





## [2.0.1-alpha.14](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.13...v2.0.1-alpha.14) (2019-02-06)


### Features

* **protractor:** Navigate.reloadPage() interaction ([60ab171](https://github.com/jan-molak/serenity-js/commit/60ab171)), closes [#236](https://github.com/jan-molak/serenity-js/issues/236)





## [2.0.1-alpha.13](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.12...v2.0.1-alpha.13) (2019-02-06)


### Features

* **protractor:** Click and DoubleClick interactions ([505e25d](https://github.com/jan-molak/serenity-js/commit/505e25d))





## [2.0.1-alpha.12](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.11...v2.0.1-alpha.12) (2019-02-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.11](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.10...v2.0.1-alpha.11) (2019-02-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.10](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.9...v2.0.1-alpha.10) (2019-02-05)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.9](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.8...v2.0.1-alpha.9) (2019-02-05)


### Bug Fixes

* **protractor:** Corrected how Text.of(Target) is represented in the reports ([ae91f95](https://github.com/jan-molak/serenity-js/commit/ae91f95))





## [2.0.1-alpha.8](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.7...v2.0.1-alpha.8) (2019-02-04)

**Note:** Version bump only for package @serenity-js/protractor





## [2.0.1-alpha.7](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.6...v2.0.1-alpha.7) (2019-02-03)


### Features

* **protractor:** Screenplay-style expectations for Protractor ([5a86862](https://github.com/jan-molak/serenity-js/commit/5a86862))





## [2.0.1-alpha.6](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.5...v2.0.1-alpha.6) (2019-02-02)


### Features

* **protractor:** Interaction: Clear ([5c8a25c](https://github.com/jan-molak/serenity-js/commit/5c8a25c))





## [2.0.1-alpha.5](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.4...v2.0.1-alpha.5) (2019-02-02)


### Bug Fixes

* **protractor:** Corrected the Text.of and Text.ofAll questions ([7f558f0](https://github.com/jan-molak/serenity-js/commit/7f558f0))





## [2.0.1-alpha.4](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.3...v2.0.1-alpha.4) (2019-02-01)


### Features

* **protractor:** First draft of the [@serenity-js](https://github.com/serenity-js)/protractor module ([0d1cb16](https://github.com/jan-molak/serenity-js/commit/0d1cb16))
