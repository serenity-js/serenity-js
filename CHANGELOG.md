# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.32.3](https://github.com/serenity-js/serenity-js/compare/v2.32.2...v2.32.3) (2021-11-06)


### Bug Fixes

* **core:** support for NPM 8 ([7cb470c](https://github.com/serenity-js/serenity-js/commit/7cb470c985a7149f058a317dcb14e6294913f9ff))
* **deps:** update dependency @babel/parser to ^7.16.2 ([2475839](https://github.com/serenity-js/serenity-js/commit/24758397fc014dca8025162cecc805a9044da642))





## [2.32.2](https://github.com/serenity-js/serenity-js/compare/v2.32.1...v2.32.2) (2021-10-04)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.15.7 ([b4afc93](https://github.com/serenity-js/serenity-js/commit/b4afc9352c4f3447c37c05d8b3110d2f9d23aa02))
* **rest:** reverted axios to 0.21.4 to avoid issue axios/axios[#4124](https://github.com/serenity-js/serenity-js/issues/4124) introduced in version 0.22.0 ([ce1fc7f](https://github.com/serenity-js/serenity-js/commit/ce1fc7f8c8dcee0c0f41a2a2663b9ebe18de740d))





## [2.32.1](https://github.com/serenity-js/serenity-js/compare/v2.32.0...v2.32.1) (2021-09-17)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.15.6 ([d977d4c](https://github.com/serenity-js/serenity-js/commit/d977d4c658e7a93b0ac6ccda4efc49c94b1bc79e))
* **deps:** update dependency @cucumber/messages to v17 ([3514a91](https://github.com/serenity-js/serenity-js/commit/3514a91b75382e3cbd03c044e8db051622d61a8a))





# [2.32.0](https://github.com/serenity-js/serenity-js/compare/v2.31.1...v2.32.0) (2021-09-08)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.15.5 ([1319565](https://github.com/serenity-js/serenity-js/commit/13195652dfb795a46bcac33804c1376845e29f1c))


### Features

* **webdriverio:** implemented Scroll interaction ([fcea8a3](https://github.com/serenity-js/serenity-js/commit/fcea8a3bcf57beecf170198b5f43628f30a8c98b))





## [2.31.1](https://github.com/serenity-js/serenity-js/compare/v2.31.0...v2.31.1) (2021-08-27)


### Bug Fixes

* **cucumber:** don't pass the "rerun" file to Cucumber if it doesn't exist ([b08eca2](https://github.com/serenity-js/serenity-js/commit/b08eca2b849194835385d0966b0f4a9895fe1d24)), closes [#971](https://github.com/serenity-js/serenity-js/issues/971) [protractor-cucumber-framework/protractor-cucumber-framework#219](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/219)
* **cucumber:** fixed duplicate "rerun" param passed to Cucumber ([8d93788](https://github.com/serenity-js/serenity-js/commit/8d937885ce1f230c41cb3b40c0e7026c859cbad6)), closes [#971](https://github.com/serenity-js/serenity-js/issues/971)





# [2.31.0](https://github.com/serenity-js/serenity-js/compare/v2.30.3...v2.31.0) (2021-08-23)


### Bug Fixes

* **jasmine:** added JasmineReporter interface ([c72d03b](https://github.com/serenity-js/serenity-js/commit/c72d03bbb4976ccb980144cf99f4ea8dbc5193bc)), closes [#962](https://github.com/serenity-js/serenity-js/issues/962)


### Features

* **jasmine:** support additional reporters injected in confg (i.e. ReportPortal) ([e2b102a](https://github.com/serenity-js/serenity-js/commit/e2b102a573878596afb7f8b7424843b468961b97))





## [2.30.3](https://github.com/serenity-js/serenity-js/compare/v2.30.2...v2.30.3) (2021-08-16)


### Bug Fixes

* **jasmine:** ensure JasmineAdapter loads configured "requires" and "helpers" ([5dfd45c](https://github.com/serenity-js/serenity-js/commit/5dfd45cd5edcc36fe98a07d5abf1f2abfe9f2624)), closes [#954](https://github.com/serenity-js/serenity-js/issues/954)





## [2.30.2](https://github.com/serenity-js/serenity-js/compare/v2.30.1...v2.30.2) (2021-08-13)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.15.3 ([dbed99e](https://github.com/serenity-js/serenity-js/commit/dbed99e4004aac0719faf0b3369d9977383de87c))
* **deps:** update dependency find-java-home to ^1.2.2 ([58cb156](https://github.com/serenity-js/serenity-js/commit/58cb1566517d055a9ba885eaafed29b07acda08f))
* **mocha:** upgraded Mocha to version 9 ([446c7b9](https://github.com/serenity-js/serenity-js/commit/446c7b9f3440303a3bfaf4197ca3cb1aeb1a72e5))





## [2.30.1](https://github.com/serenity-js/serenity-js/compare/v2.30.0...v2.30.1) (2021-08-09)


### Bug Fixes

* **core:** updated FileSystem APIs so that they're compatible with the latest @types/node ([ef41c07](https://github.com/serenity-js/serenity-js/commit/ef41c074a8179435da07988e26feeea68e0d3336))
* **deps:** update dependency @babel/parser to ^7.15.2 ([8e2857f](https://github.com/serenity-js/serenity-js/commit/8e2857f0f98b9c388b169b3ae4eab62bbd9098ca))
* **deps:** update dependency @cucumber/cucumber to ^7.3.1 ([aa72038](https://github.com/serenity-js/serenity-js/commit/aa72038b785f69ad9c2c9e3fe33daf6481f6da0d))
* **deps:** update dependency chalk to ^4.1.2 ([8aec8b3](https://github.com/serenity-js/serenity-js/commit/8aec8b377279ca2e9edd0b6f867f1c32d8d32011))
* **deps:** update dependency graceful-fs to ^4.2.8 ([3b57394](https://github.com/serenity-js/serenity-js/commit/3b57394f0e6c5cb0ed55e065301642090c4c286e))
* **deps:** update dependency jasmine to ^3.8.0 ([e4fd8c1](https://github.com/serenity-js/serenity-js/commit/e4fd8c1a4c73314aa46b8ff03035c4096f3bdca3))
* **examples:** update dependency jasmine to ^3.8.0 ([5629a90](https://github.com/serenity-js/serenity-js/commit/5629a906a2c32ccf69bd74aefcd1dabc3394d66f))
* **webdriverio:** you can import WebdriverIOConfig from @serenity-js/webdriverio ([59703bf](https://github.com/serenity-js/serenity-js/commit/59703bf4fb13488bce2382eb411e67b4342e0e2d))





# [2.30.0](https://github.com/serenity-js/serenity-js/compare/v2.29.9...v2.30.0) (2021-08-06)


### Bug Fixes

* **core:** corrected how the interaction to Log reports the names of logged values ([93ea489](https://github.com/serenity-js/serenity-js/commit/93ea489dcf25d8e6ee62794b0958e1cafdbf2e4d))


### Features

* **webdriverio:** enabled integration with WebdriverIO ([c025086](https://github.com/serenity-js/serenity-js/commit/c0250864b4492e7a619e3ac746f1d058cbe26794)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)





## [2.29.9](https://github.com/serenity-js/serenity-js/compare/v2.29.8...v2.29.9) (2021-08-03)


### Bug Fixes

* **core:** actor ensures any async activities are synchronised before moving on to next interaction ([ccc83c8](https://github.com/serenity-js/serenity-js/commit/ccc83c8b8360898f10b71e6c2a378e9c8fc1f340))





## [2.29.8](https://github.com/serenity-js/serenity-js/compare/v2.29.7...v2.29.8) (2021-07-24)


### Bug Fixes

* **cucumber:** updated @cucumber/cucumber to 7.3.1 ([a8d20fa](https://github.com/serenity-js/serenity-js/commit/a8d20faa1ed7b8b664327892bdbc987dba38ce3d))
* **deps:** update dependency @babel/parser to ^7.14.8 ([fba26be](https://github.com/serenity-js/serenity-js/commit/fba26beba433ed6caabd206a8e74354a33da6e77))
* **deps:** update dependency fast-glob to ^3.2.7 ([f81fbaa](https://github.com/serenity-js/serenity-js/commit/f81fbaaa519cc42d333a8db6b5d294f2e812e907))
* **deps:** updated dependencies ([e843503](https://github.com/serenity-js/serenity-js/commit/e84350360044658951afa8765f726ebf2a18119f))





## [2.29.7](https://github.com/serenity-js/serenity-js/compare/v2.29.6...v2.29.7) (2021-07-23)


### Bug Fixes

* **deps:** update dependency filenamify to v5 ([b74e674](https://github.com/serenity-js/serenity-js/commit/b74e674fd581f6acde9add69fd185dd9aad235fa))
* **deps:** updated TypeScript ([df3b846](https://github.com/serenity-js/serenity-js/commit/df3b8460b7496a40f338a531f13297d63594fdf9)), closes [#849](https://github.com/serenity-js/serenity-js/issues/849)
* **protractor:** corrected type definitions to work with the latest TypeScript ([9260520](https://github.com/serenity-js/serenity-js/commit/926052094341cacead2d6fe97d9402c6f7577d46))





## [2.29.6](https://github.com/serenity-js/serenity-js/compare/v2.29.5...v2.29.6) (2021-06-28)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.14.7 ([1f18136](https://github.com/serenity-js/serenity-js/commit/1f181366f5a2de2a8eb28293f4570ed149e9abbc))
* **deps:** update dependency fast-glob to ^3.2.6 ([581bb05](https://github.com/serenity-js/serenity-js/commit/581bb057f93557b5b9cc0ac1b6331760e6d6d537))





## [2.29.5](https://github.com/serenity-js/serenity-js/compare/v2.29.4...v2.29.5) (2021-06-28)


### Bug Fixes

* **cucumber:** support for reporting Node AssertionErrors thrown in Cucumber scenarios ([3d9cdb7](https://github.com/serenity-js/serenity-js/commit/3d9cdb745cd14f136b942786b449375f1a00d969)), closes [cucumber/cucumber-js#1453](https://github.com/cucumber/cucumber-js/issues/1453) [#887](https://github.com/serenity-js/serenity-js/issues/887)





## [2.29.4](https://github.com/serenity-js/serenity-js/compare/v2.29.3...v2.29.4) (2021-06-24)


### Bug Fixes

* **core:** support for reporting Node-specific assertion errors ([3d2ca1f](https://github.com/serenity-js/serenity-js/commit/3d2ca1fe7e3e4d0fe6445b9807a5875d140042bf))





## [2.29.3](https://github.com/serenity-js/serenity-js/compare/v2.29.2...v2.29.3) (2021-06-17)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.14.6 ([745db95](https://github.com/serenity-js/serenity-js/commit/745db9505df496fd98506fe2bb968ba315ff341a))
* **deps:** update dependency @cucumber/messages to v16 ([86f6bf9](https://github.com/serenity-js/serenity-js/commit/86f6bf95d5bd7eeb5190f31ee3d4f80be66a22de))





## [2.29.2](https://github.com/serenity-js/serenity-js/compare/v2.29.1...v2.29.2) (2021-06-13)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.14.5 ([0c043ca](https://github.com/serenity-js/serenity-js/commit/0c043ca865a987099433f18e47182e7adf07b739))





## [2.29.1](https://github.com/serenity-js/serenity-js/compare/v2.29.0...v2.29.1) (2021-06-08)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.14.4 ([ffa5677](https://github.com/serenity-js/serenity-js/commit/ffa5677902e61de067afbdd277bd6bd06da5444f))
* **deps:** update dependency find-java-home to ^1.2.1 ([9edeb7a](https://github.com/serenity-js/serenity-js/commit/9edeb7a2ccc255d77d8a6a08ed6effaa6ed61e8f))





# [2.29.0](https://github.com/serenity-js/serenity-js/compare/v2.28.1...v2.29.0) (2021-06-06)


### Bug Fixes

* **protractor:** bumped peer dependencies ([b47783d](https://github.com/serenity-js/serenity-js/commit/b47783d007db14580e59affca2b21aa20c77ac49))


### Features

* **protractor:** support for Chrome 91 ([ac108c8](https://github.com/serenity-js/serenity-js/commit/ac108c8e0237875e69245c54855668354da02d5a)), closes [angular/protractor#5519](https://github.com/angular/protractor/issues/5519)





## [2.28.1](https://github.com/serenity-js/serenity-js/compare/v2.28.0...v2.28.1) (2021-05-13)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.14.2 ([9c4a812](https://github.com/serenity-js/serenity-js/commit/9c4a812f40c95a9b1a8bade8302c45b5e4eb9130))





# [2.28.0](https://github.com/serenity-js/serenity-js/compare/v2.27.1...v2.28.0) (2021-05-12)


### Bug Fixes

* **deps:** migrated from TSLint to ESLint ([0c7580b](https://github.com/serenity-js/serenity-js/commit/0c7580b5fa06f9fa1796f0e9e19da45190940dfd)), closes [#842](https://github.com/serenity-js/serenity-js/issues/842)


### Features

* **node:** introduced support for Node.js 16.x, dropped support for Node.js 10.x ([0f67dcc](https://github.com/serenity-js/serenity-js/commit/0f67dcc63f904a4df48e331d12a37f40f6814cee)), closes [#842](https://github.com/serenity-js/serenity-js/issues/842)
* **protractor:** implemented right click ([eeddb7f](https://github.com/serenity-js/serenity-js/commit/eeddb7fd3664e19d27c640b7f866c46b4c480c38)), closes [#833](https://github.com/serenity-js/serenity-js/issues/833)





## [2.27.1](https://github.com/serenity-js/serenity-js/compare/v2.27.0...v2.27.1) (2021-05-04)


### Bug Fixes

* **serenity-bdd:** downgraded Yargs to v16.2.0 to avoid dropping support for Node 10 just yet ([5bedd26](https://github.com/serenity-js/serenity-js/commit/5bedd260fb5e2a8313ff95088b82efba1a752fef))





# [2.27.0](https://github.com/serenity-js/serenity-js/compare/v2.26.2...v2.27.0) (2021-05-03)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.14.0 ([5f97160](https://github.com/serenity-js/serenity-js/commit/5f97160cd165f8d2271c3f4f066edcd93b9a4a7e))
* **deps:** update dependency filenamify to ^4.3.0 ([35d8de9](https://github.com/serenity-js/serenity-js/commit/35d8de93b138e9df3fbbc6e7db49937c867eec1c))
* **deps:** update dependency yargs to v17 ([8ad524a](https://github.com/serenity-js/serenity-js/commit/8ad524a512814f93c721494db9922dce537102d2))


### Features

* **core:** new interface StageCrewMemberBuilder and an easy way to redirect output to a file ([40c3086](https://github.com/serenity-js/serenity-js/commit/40c3086c6783f1bb56fffc84b30949d697bed182)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)





## [2.26.2](https://github.com/serenity-js/serenity-js/compare/v2.26.1...v2.26.2) (2021-04-22)


### Bug Fixes

* **cucumber:** updated Cucumber to 7.2.1 ([ec1a765](https://github.com/serenity-js/serenity-js/commit/ec1a765dfaf1ed0b7e26756f209204d778aa3d11)), closes [cucumber/cucumber-js#1646](https://github.com/cucumber/cucumber-js/issues/1646)
* **deps:** update dependency @babel/parser to ^7.13.16 ([3b91999](https://github.com/serenity-js/serenity-js/commit/3b919995e5fba7321dd16fde00e95136cceb3c7c))
* **deps:** update dependency chalk to ^4.1.1 ([89011dd](https://github.com/serenity-js/serenity-js/commit/89011dda2aaf795d8991f68821e74256ed0d62e3))





## [2.26.1](https://github.com/serenity-js/serenity-js/compare/v2.26.0...v2.26.1) (2021-04-21)


### Bug Fixes

* **cucumber:** upgraded Cucumber to 7.1.0 ([ee4ba3d](https://github.com/serenity-js/serenity-js/commit/ee4ba3da46f8351961b486280e9830a08789d764)), closes [cucumber/cucumber-js#1646](https://github.com/cucumber/cucumber-js/issues/1646)





# [2.26.0](https://github.com/serenity-js/serenity-js/compare/v2.25.9...v2.26.0) (2021-04-15)


### Bug Fixes

* **core:** a new RetryableSceneDetected event emitted by Mocha and Cucumber adapters ([eda5b00](https://github.com/serenity-js/serenity-js/commit/eda5b0006c33d708b619a8fdedc89a64da3251fc)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)


### Features

* **mocha:** serenity/JS Mocha reporter emits TestSuiteStarts and TestSuiteFinished domain events ([8d67f79](https://github.com/serenity-js/serenity-js/commit/8d67f7941e4d70068f8f2110b88af6ef8425e64d)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)





## [2.25.9](https://github.com/serenity-js/serenity-js/compare/v2.25.8...v2.25.9) (2021-04-10)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.13.15 ([cf170e8](https://github.com/serenity-js/serenity-js/commit/cf170e87bfed177f95e8db5e778b3d7494e65389))
* **deps:** update dependency find-java-home to ^1.2.0 ([5fd4a25](https://github.com/serenity-js/serenity-js/commit/5fd4a2585b7b9f96c49790f877954c39eef53424))
* **deps:** updated dependencies ([6a8cdf8](https://github.com/serenity-js/serenity-js/commit/6a8cdf8e57f62c1f332bc22114ef3933ecf915c0))
* **website:** fixed a link ([3641235](https://github.com/serenity-js/serenity-js/commit/364123558a48b7a185b98691fb205d211916c380)), closes [#803](https://github.com/serenity-js/serenity-js/issues/803)





## [2.25.8](https://github.com/serenity-js/serenity-js/compare/v2.25.7...v2.25.8) (2021-03-27)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.13.13 ([998f549](https://github.com/serenity-js/serenity-js/commit/998f549140f82d33439e78321e7f717f04277648))
* **deps:** update dependency @cucumber/messages to v15 ([f3286af](https://github.com/serenity-js/serenity-js/commit/f3286af3d44e553c290553993be9e31cff04cf28))





## [2.25.7](https://github.com/serenity-js/serenity-js/compare/v2.25.6...v2.25.7) (2021-03-23)


### Bug Fixes

* **deps-dev:** (internal) standardised internal dev-dependency versions across Serenity/JS modules ([a411cea](https://github.com/serenity-js/serenity-js/commit/a411ceabadc83e82ec87a492a1738b13773adb13))





## [2.25.6](https://github.com/serenity-js/serenity-js/compare/v2.25.5...v2.25.6) (2021-03-22)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.13.12 ([a5c7a9c](https://github.com/serenity-js/serenity-js/commit/a5c7a9c4b5360b0eec01d562e04a0d855521512a))
* **serenity-bdd:** support for reporting descriptions of Cucumber Rules ([1f21725](https://github.com/serenity-js/serenity-js/commit/1f217256457711c468f0c56897395a71ab1dd09c))





## [2.25.5](https://github.com/serenity-js/serenity-js/compare/v2.25.4...v2.25.5) (2021-03-22)


### Bug Fixes

* **serenity-bdd:** upgraded Serenity BDD CLI to 2.3.31 and migrated from Bintray to Maven Central ([1e0e98f](https://github.com/serenity-js/serenity-js/commit/1e0e98fcd69c9d68625854eb05639a182c9dd5fe))





## [2.25.4](https://github.com/serenity-js/serenity-js/compare/v2.25.3...v2.25.4) (2021-03-21)


### Bug Fixes

* **deps:** updated dependencies ([32a41eb](https://github.com/serenity-js/serenity-js/commit/32a41eb8a8b4386b6b03111c1adf48e1e0aabdbb))





## [2.25.3](https://github.com/serenity-js/serenity-js/compare/v2.25.2...v2.25.3) (2021-03-20)


### Bug Fixes

* **core:** Support tags with "issues" in their name, i.e. "known_issues". ([d53c9be](https://github.com/serenity-js/serenity-js/commit/d53c9bec261eef6d7c11aeeeca309bff9a7c9739))





## [2.25.2](https://github.com/serenity-js/serenity-js/compare/v2.25.1...v2.25.2) (2021-03-18)

**Note:** Version bump only for package serenity-js-monorepo





## [2.25.1](https://github.com/serenity-js/serenity-js/compare/v2.25.0...v2.25.1) (2021-03-17)


### Bug Fixes

* **deps:** update dependency @babel/parser to ^7.13.11 ([92167a5](https://github.com/serenity-js/serenity-js/commit/92167a5f7fd10e7ca4ee54ba6e965a957d436a6f))
* **deps:** update dependency fast-glob to ^3.2.5 ([92ab1c4](https://github.com/serenity-js/serenity-js/commit/92ab1c4aae0b9d32c9df78049cb30dbc601ceb8e))
* **deps:** update dependency graceful-fs to ^4.2.6 ([978275a](https://github.com/serenity-js/serenity-js/commit/978275acb6d21d0148d40bd0c100005372011b37))
* **deps:** update dependency yargs to ^16.2.0 ([dd7ddf5](https://github.com/serenity-js/serenity-js/commit/dd7ddf586b0dd6ee3f29fc96e4767568c7a311d0))
* **protractor:** relaxed peerDependencies version range ([2542bf2](https://github.com/serenity-js/serenity-js/commit/2542bf2ef09216dc6ef8b8ac08395f6bf101d878))





# [2.25.0](https://github.com/serenity-js/serenity-js/compare/v2.24.1...v2.25.0) (2021-03-15)


### Bug Fixes

* **core:** moved RelativeQuestion interface to core and renamed to MetaQuestion ([fdc9500](https://github.com/serenity-js/serenity-js/commit/fdc9500d68509497d2a6036a5e416637f94b8632))
* **protractor:** added an explicit dependency on @serenity-js/assertions ([0d0dda3](https://github.com/serenity-js/serenity-js/commit/0d0dda3fc6d346eb3940e959b8a314e900ea27ed))
* **protractor:** deprecated experimental Pick; use Target.all().located().where(...) instead ([81b9c36](https://github.com/serenity-js/serenity-js/commit/81b9c36436421ac1f280bb501dde558f442c1ead))


### Features

* **assertions:** re-exported Expectation and Check from core to avoid breaking tests using Serenity/JS 2.24.1 and older ([5ef1096](https://github.com/serenity-js/serenity-js/commit/5ef10966f6af88c24a7d27b7123ec4087f0e2d66))
* **core:** moved Check from @serenity-js/assertions to @serenity-js/core ([1f36581](https://github.com/serenity-js/serenity-js/commit/1f365811796f8581064ae3601985cf10f6565feb))
* **core:** moved Expectation from @serenity-js/assertions to @serenity-js/core ([208391e](https://github.com/serenity-js/serenity-js/commit/208391e7b0f9dab177e0b5305e6b8fb2415cb7f4))
* **core:** new question List to help retrieve a specific item from a collection ([2de991a](https://github.com/serenity-js/serenity-js/commit/2de991a7ba893098cc999110678f6390b7101e03))
* **core:** new questions Property.of and Property.at help retrieve properties of Answerable<object> ([a807df9](https://github.com/serenity-js/serenity-js/commit/a807df9aeba5770a290abdb80b5e212702aa3b6c))
* **protractor:** new APIs to make it easier to pick a specific element from Target.all ([f697d39](https://github.com/serenity-js/serenity-js/commit/f697d3917db6185000911304d390df1f5163c27f))





## [2.24.1](https://github.com/serenity-js/serenity-js/compare/v2.24.0...v2.24.1) (2021-02-28)


### Bug Fixes

* **core:** corrected package.json to mention all the Node and NPM versions supported by Serenity/JS ([9fff39a](https://github.com/serenity-js/serenity-js/commit/9fff39a962ad6e75596e0c8e3f8534a67c20d001))





# [2.24.0](https://github.com/serenity-js/serenity-js/compare/v2.23.2...v2.24.0) (2021-02-26)


### Bug Fixes

* **cucumber:** corrected min version of Cucumber 3 peer dependency (3.2.2 => 3.2.1) ([77425c0](https://github.com/serenity-js/serenity-js/commit/77425c083dcb634da067c36583f0e5fa0e05b7aa))


### Features

* **cucumber:** support for `rerun` and better handling of empty tags ([4001da2](https://github.com/serenity-js/serenity-js/commit/4001da234cac5eab94fb93cb40ca457e9be2b4ab))
* **protractor:** protractor adapter merges `capability`-level test runner config with root config ([f8a830c](https://github.com/serenity-js/serenity-js/commit/f8a830c87908163527cc2104834ef02f025d1f7f)), closes [protractor-cucumber-framework/protractor-cucumber-framework#73](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/73)
* **protractor:** suppport for Cucumber no-strict mode ([5d13bd5](https://github.com/serenity-js/serenity-js/commit/5d13bd5c7d582e04d801c92d71db42836305516b)), closes [protractor-cucumber-framework/protractor-cucumber-framework#181](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/181)





## [2.23.2](https://github.com/serenity-js/serenity-js/compare/v2.23.1...v2.23.2) (2021-02-23)


### Bug Fixes

* **protractor:** optional Serenity/JS modules are marked as peerDependencies to avoid NPM installing them by default ([433afa1](https://github.com/serenity-js/serenity-js/commit/433afa1ab9d92635f14df50af6f0bf720e91c69e)), closes [npm/npm#3066](https://github.com/npm/npm/issues/3066)





## [2.23.1](https://github.com/serenity-js/serenity-js/compare/v2.23.0...v2.23.1) (2021-02-21)


### Bug Fixes

* **core:** corrected error message produced by StageManager when async operations time out ([54e2c49](https://github.com/serenity-js/serenity-js/commit/54e2c494868c6d46121f0aa723cc3c88e2dfbe82))
* **core:** FileSystem.remove doesn't complain if the file to be removed doesn't exist ([46492e4](https://github.com/serenity-js/serenity-js/commit/46492e49e920cba30c1a12dad1a2869184a7c355))
* **core:** refactored test runner adapters to introduce a common interface they all implement ([bf82e7c](https://github.com/serenity-js/serenity-js/commit/bf82e7c5c494f12cd9f372fa2e6bf9e432f0e14f))
* **cucumber:** add Cucumber 1.x 'colors` option to CucumberConfig ([044d0e7](https://github.com/serenity-js/serenity-js/commit/044d0e7f37d004e74c2dce4d67dfb69c983db321))
* **cucumber:** CucumberConfig ignores empty values and supports specifying worldParameters as object ([8ecb882](https://github.com/serenity-js/serenity-js/commit/8ecb88260c8d20b400d66287ea20a7fa8ae1011c))
* **protractor:** improved support for native Cucumber reporters ([2f4bdcf](https://github.com/serenity-js/serenity-js/commit/2f4bdcf35206b1f54bd19a0f7f84d4c3d0d34090)), closes [protractor-cucumber-framework/protractor-cucumber-framework#73](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/73)
* **protractor:** native Cucumber.js formatters print to unique output files when needed ([bfef775](https://github.com/serenity-js/serenity-js/commit/bfef775fefff9be9f92167459f603a44d4450642)), closes [protractor-cucumber-framework/protractor-cucumber-framework#73](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/73)





# [2.23.0](https://github.com/serenity-js/serenity-js/compare/v2.22.0...v2.23.0) (2021-02-16)


### Bug Fixes

* **core:** q supports having multiple Answerables in a template ([05f0d9d](https://github.com/serenity-js/serenity-js/commit/05f0d9dd637e435b2acd6a408bc8c87f3d477b41))
* **protractor:** better error message when Navigate fails ([3f4bac7](https://github.com/serenity-js/serenity-js/commit/3f4bac79b57976cabb27bd23712e2f096484c02b))
* **protractor:** fixed potential synchronisation issue in Select ([fb451c7](https://github.com/serenity-js/serenity-js/commit/fb451c731e0553220003c70c8695d36856e6a500))
* **protractor:** improved support for native Cucumber.js reporters on Windows ([ced153c](https://github.com/serenity-js/serenity-js/commit/ced153cbbcad6fd061adf4c1c84a4d60211a4cd3)), closes [protractor-cucumber-framework/protractor-cucumber-framework#73](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/73)


### Features

* **protractor:** Serenity/JS Cucumber adapter supports native Cucumber.js reporters ([bbf00c0](https://github.com/serenity-js/serenity-js/commit/bbf00c0a22e8d788b4c84c3d3bc94338f675e7cc)), closes [protractor-cucumber-framework/protractor-cucumber-framework#73](https://github.com/protractor-cucumber-framework/protractor-cucumber-framework/issues/73)





# [2.22.0](https://github.com/serenity-js/serenity-js/compare/v2.21.0...v2.22.0) (2021-01-27)


### Features

* **rest:** new interaction to set a request header for all the subsequent requests ([c1c9be0](https://github.com/serenity-js/serenity-js/commit/c1c9be00fc81bf015d81f1535a40d71ff3af8cbb))





# [2.21.0](https://github.com/serenity-js/serenity-js/compare/v2.20.1...v2.21.0) (2021-01-26)


### Bug Fixes

* **rest:** all HTTPRequests can be configured in-line using Answerable<AxiosRequestConfig> ([2e982f4](https://github.com/serenity-js/serenity-js/commit/2e982f44db7bfb50be4523ea2617529044506ffc))
* **rest:** upgraded Axios to 0.21.1 ([4b08f90](https://github.com/serenity-js/serenity-js/commit/4b08f90cc42bd7ec1f5a6e3006dfffe2aaa72477))
* **serenity-bdd:** corrected reporting of errors thrown in non-Screenplay scenarios ([dedf3ae](https://github.com/serenity-js/serenity-js/commit/dedf3ae47212e0830284af5a6ea26c9c652c7c9b))
* **serenity-bdd:** improved reporting of unusual "errors" ([8c2a850](https://github.com/serenity-js/serenity-js/commit/8c2a8501a4395d74b731c13c1a99a89abd966fc4)), closes [#549](https://github.com/serenity-js/serenity-js/issues/549)


### Features

* **core:** event TestRunStarts is now emitted before the first scenario starts ([fd30d39](https://github.com/serenity-js/serenity-js/commit/fd30d393831e9ed80c9f9b63edc863b8ae779de5))
* **core:** SceneFinishes informs StageCrewMembers about the Outcome of the scenario ([abfca70](https://github.com/serenity-js/serenity-js/commit/abfca70e91633c068617d8d273a302aaab692265))





## [2.20.1](https://github.com/serenity-js/serenity-js/compare/v2.20.0...v2.20.1) (2021-01-23)


### Bug Fixes

* **deps:** updated tiny-types ([e81a6ea](https://github.com/serenity-js/serenity-js/commit/e81a6ea804286083da118f9141ebbfd52746b581))
* **rest:** a full URL of an API request is now reported, instead of just the path ([1996c8a](https://github.com/serenity-js/serenity-js/commit/1996c8a16ca1f4c84d2703e410b46d4917102260))
* **serenity-bdd:** improved reporting of JSON and XML API responses ([750bc00](https://github.com/serenity-js/serenity-js/commit/750bc004ccbb025ccad946749892f7c7b42ffbab)), closes [#709](https://github.com/serenity-js/serenity-js/issues/709) [#722](https://github.com/serenity-js/serenity-js/issues/722)





# [2.20.0](https://github.com/serenity-js/serenity-js/compare/v2.19.10...v2.20.0) (2021-01-18)


### Bug Fixes

* **console-reporter:** don't pollute the log with stack traces of ImplementationPendingError ([fb3b97a](https://github.com/serenity-js/serenity-js/commit/fb3b97ad62e33b21135a8da6be0490eadd31c891))
* **core:** ensure all the DomainEvents are always correct at runtime ([1341bfb](https://github.com/serenity-js/serenity-js/commit/1341bfb24a7db39fe73921c6d6f7dffa287a6747))
* **core:** ModuleLoader.hasAvailable checks if a given dependency is available ([f67c982](https://github.com/serenity-js/serenity-js/commit/f67c982a15d339c71b52e9afab81666df6c76ad1))
* **core:** ScenarioParameters now requires Description to be provided ([cfa4800](https://github.com/serenity-js/serenity-js/commit/cfa4800d436c165a9dbe74e71d76715084354f46))
* **cucumber:** corrected how Cucumber hooks are reported ([3ae1cd7](https://github.com/serenity-js/serenity-js/commit/3ae1cd744e6262b7e3eeff7796e579a201639eb8))
* **cucumber:** corrected the CucumberFormatterOptions interface ([463047b](https://github.com/serenity-js/serenity-js/commit/463047ba764fd2773d8a3b98f09b842ccb1a614c))
* **cucumber:** corrected the type definition of CucumberConfig#worldParameters ([570c3b6](https://github.com/serenity-js/serenity-js/commit/570c3b637d87093d9cad411e762839cc78fd968d))


### Features

* **core:** support for reporting BusinessRules ([02efcee](https://github.com/serenity-js/serenity-js/commit/02efceeb10c5f872f720bd2270630cde60268bef))
* **cucumber:** Support for Cucumber 7 ([80126b1](https://github.com/serenity-js/serenity-js/commit/80126b1c30d92a33ee80b4679ab6673e456e13b9))
* **serenity-bdd:** support for reporting business rules ([3920852](https://github.com/serenity-js/serenity-js/commit/3920852d940efe1b52f2c79732873e8d7283f7d6))
* **serenity-bdd:** upgraded to Serenity BDD CLI 2.1.12 and improved the downloader ([1ad82e1](https://github.com/serenity-js/serenity-js/commit/1ad82e10b482e99bba8c247d3822014f208ecba4)), closes [#625](https://github.com/serenity-js/serenity-js/issues/625)





## [2.19.10](https://github.com/serenity-js/serenity-js/compare/v2.19.9...v2.19.10) (2020-12-22)


### Bug Fixes

* **core:** reduced the max length of an artifact file name to better support Windows OS ([e771362](https://github.com/serenity-js/serenity-js/commit/e771362af018641ea157036261a4de1190693ac9)), closes [#714](https://github.com/serenity-js/serenity-js/issues/714)





## [2.19.9](https://github.com/serenity-js/serenity-js/compare/v2.19.8...v2.19.9) (2020-12-15)


### Bug Fixes

* **assertions:** corrected how the interaction to Check is reported ([fca99a6](https://github.com/serenity-js/serenity-js/commit/fca99a6b620d643e872e1379e86f1511b0292ff8)), closes [#713](https://github.com/serenity-js/serenity-js/issues/713)
* **core:** ensure file names produced by the ArtifactArchiver contain only URL-friendly characters ([6c7abcc](https://github.com/serenity-js/serenity-js/commit/6c7abccb00a72cdad673fe9a2a806f02ca9eed81)), closes [#634](https://github.com/serenity-js/serenity-js/issues/634)


### Performance Improvements

* **core:** simplified Artifact validation to make it perform better with large screenshots ([ff365db](https://github.com/serenity-js/serenity-js/commit/ff365db0971f8208c5bd1ad6a6f8f1f1e7c15381))





## [2.19.8](https://github.com/serenity-js/serenity-js/compare/v2.19.7...v2.19.8) (2020-12-15)


### Bug Fixes

* **core:** serenity-js/core is now a direct dependency of all the Serenity/JS modules ([4561862](https://github.com/serenity-js/serenity-js/commit/45618629c319041eedc0a64174d2b342fffadfa4))





## [2.19.7](https://github.com/serenity-js/serenity-js/compare/v2.19.6...v2.19.7) (2020-12-10)

**Note:** Version bump only for package serenity-js-monorepo





## 2.19.6 (2020-12-10)

**Note:** Version bump only for package serenity-js-monorepo





## 2.19.5 (2020-12-10)

### Bug Fixes

* **core:** exported `q` so that it's available under @serenity-js/core ([49d4f81](https://github.com/serenity-js/serenity-js/commit/49d4f813d3e8f1afcc159c31f4c6b476a2a0a0a0))
* **core:** removed unnecessary quotes surrounding the name of the note in TakeNote.toString ([faddee8](https://github.com/serenity-js/serenity-js/commit/faddee835a280fca066088b2b9b6e0500cb5811a))
* **protractor:** cucumberOpts.require patterns are now resolved relative to protractor config dir ([9d9973f](https://github.com/serenity-js/serenity-js/commit/9d9973f984445c5ddb33e1ce9902b2b3890f2c20)), closes [#632](https://github.com/serenity-js/serenity-js/issues/632)


### Features

* **core:** `q` makes Question<string> templates as easy as regular string templates ([9db29f8](https://github.com/serenity-js/serenity-js/commit/9db29f89c2360f28d56890d15ced4e9b4d538dc5))

## 2.19.4 (2020-11-30)


### Bug Fixes

* **protractor:** improved the description of the ProtractorParam question ([e9e1cae](https://github.com/serenity-js/serenity-js/commit/e9e1caef0b726e1060d1766bce6cf7a9396e118c))





## 2.19.3 (2020-11-26)

**Note:** Version bump only for package serenity-js-monorepo





## 2.19.2 (2020-11-26)

**Note:** Version bump only for package serenity-js-monorepo





## 2.19.1 (2020-11-25)


### Bug Fixes

* **deps:** updated dependencies ([25e316d](https://github.com/serenity-js/serenity-js/commit/25e316d8d5db2e9c9e44914d2017a2b004cb6eb7))





# 2.19.0 (2020-11-25)

### Features

* **protractor:** EXPERIMENTAL: Custom extensions can be mixed into BrowseTheWeb ([3b26baa](https://github.com/serenity-js/serenity-js/commit/3b26baab1f2c2108648d2c3093e69326aaa1dfc4))
* **core** abilities can be initialised and discarded automatically ([e537ae9](https://github.com/serenity-js/serenity-js/commit/e537ae9147478404f77845a994951fbebc3b1f83))
* **protractor** navigate.to marks test as compromised if the page couldn't be navigated to ([9823ff8](https://github.com/serenity-js/serenity-js/commit/9823ff8600c7aafeb41438f313f14258b4287988))


## 2.18.2 (2020-11-22)


### Bug Fixes

* **core:** better support for abilities that are discarded asynchronously ([fb130b6](https://github.com/serenity-js/serenity-js/commit/fb130b626074337735f944308db4982c30824485))





## 2.18.1 (2020-11-21)

**Note:** Version bump only for package serenity-js-monorepo





# 2.18.0 (2020-11-17)


### Features

* **core:** Cross-scenario Actors + improved Ability lifecycle management (version bump) ([5f30cc2](https://github.com/serenity-js/serenity-js/commit/5f30cc2583e706f1527f47dee265fe570603e9a6))





## 2.17.16 (2020-11-17)

**Note:** Version bump only for package serenity-js-monorepo





## 2.17.15 (2020-11-14)

**Note:** Version bump only for package serenity-js-monorepo





## 2.17.14 (2020-11-14)

**Note:** Version bump only for package serenity-js-monorepo





## 2.17.13 (2020-11-14)

**Note:** Version bump only for package serenity-js-monorepo





## 2.17.12 (2020-11-14)


### Bug Fixes

* **deps:** updated dependencies ([0b5abc7](https://github.com/serenity-js/serenity-js/commit/0b5abc7f4a9f026d49691e844315e1ba8677c282))





## 2.17.11 (2020-11-14)

**Note:** Version bump only for package serenity-js-monorepo





## 2.17.10 (2020-11-06)

**Note:** Version bump only for package serenity-js-monorepo





## 2.17.9 (2020-11-06)

**Note:** Version bump only for package serenity-js-monorepo





## 2.17.8 (2020-11-06)

**Note:** Version bump only for package serenity-js-monorepo





## 2.17.7 (2020-11-06)

**Note:** Version bump only for package serenity-js-monorepo





## 2.17.6 (2020-11-06)

**Note:** Version bump only for package serenity-js-monorepo





## [2.17.5](https://github.com/serenity-js/serenity-js/compare/v2.17.4...v2.17.5) (2020-11-05)


### Bug Fixes

* **assertions:** auto-generated description of an Expectation can be overridden via describedAs ([f5d02fa](https://github.com/serenity-js/serenity-js/commit/f5d02fafdd1c4fcee76d0011e2c916915adc86a3))





## [2.17.4](https://github.com/serenity-js/serenity-js/compare/v2.17.3...v2.17.4) (2020-10-28)


### Bug Fixes

* **serenity-bdd:** serenity-bdd update supports proxies ([0dd4680](https://github.com/serenity-js/serenity-js/commit/0dd4680f97387517d47d670e705553c2426881e1)), closes [#356](https://github.com/serenity-js/serenity-js/issues/356)





## [2.17.3](https://github.com/serenity-js/serenity-js/compare/v2.17.2...v2.17.3) (2020-10-25)


### Bug Fixes

* **protractor:** presence of modal dialog windows will no longer impact the Photographer ([eedae92](https://github.com/serenity-js/serenity-js/commit/eedae92da3d172f97290696edc5ad6ca21903b00)), closes [#532](https://github.com/serenity-js/serenity-js/issues/532)





## [2.17.2](https://github.com/serenity-js/serenity-js/compare/v2.17.1...v2.17.2) (2020-10-24)


### Bug Fixes

* **core:** all Activity-related events can be correlated with the Scene they originate from ([6cf0eca](https://github.com/serenity-js/serenity-js/commit/6cf0eca7670db01ac317587996fc3ea5984de059))
* **core:** it's easier for reporters to associate artifacts with scenes they've originated from ([1ccdc99](https://github.com/serenity-js/serenity-js/commit/1ccdc998af4049d6c91dc263b16a7d8c7d84bbfa))
* **core:** refactored the internal domain events so that they're easier to aggregate and correlate ([943c016](https://github.com/serenity-js/serenity-js/commit/943c016ed3e404c9c1aacf8342e42626d4d85d04))
* **protractor:** photographer ignores closed browser windows ([8991f07](https://github.com/serenity-js/serenity-js/commit/8991f07d8238ad91763eadc42ba7688c0da83b04)), closes [#680](https://github.com/serenity-js/serenity-js/issues/680) [#506](https://github.com/serenity-js/serenity-js/issues/506)
* **serenity-bdd:** reporter is capable of rendering errors with no stack trace ([ac38585](https://github.com/serenity-js/serenity-js/commit/ac38585f98b6d857b8a786522ab628aa99fbdb0c))
* **serenity-bdd:** support for out-of-order events in SerenityBDDReporter ([77db83e](https://github.com/serenity-js/serenity-js/commit/77db83e722602b1f39aba7cde113bfb5724842b5)), closes [#518](https://github.com/serenity-js/serenity-js/issues/518)
* **website:** links to changelog entries are generated correctly ([b5e4561](https://github.com/serenity-js/serenity-js/commit/b5e45617fb4e3cc9060addd18acc7197698b23b0)), closes [#686](https://github.com/serenity-js/serenity-js/issues/686)





## [2.17.1](https://github.com/serenity-js/serenity-js/compare/v2.17.0...v2.17.1) (2020-10-08)


### Bug Fixes

* **core:** improved ErrorSerialiser so that it works with cyclic data structures ([9309302](https://github.com/serenity-js/serenity-js/commit/9309302d0ca7ec4bc27e414813a18c301cf3ef02))





# [2.17.0](https://github.com/serenity-js/serenity-js/compare/v2.16.0...v2.17.0) (2020-10-05)


### Bug Fixes

* **core:** make sure Question.isAQuestion works with any invalid values that might be thrown at it ([2d6bf91](https://github.com/serenity-js/serenity-js/commit/2d6bf91405ad464237010bf2f1dc409a36fcb87d))
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

**Note:** Version bump only for package serenity-js-monorepo





# [2.13.0](https://github.com/serenity-js/serenity-js/compare/v2.12.3...v2.13.0) (2020-07-25)


### Features

* **protractor:** support for handling modal dialog windows ([2dfb44c](https://github.com/serenity-js/serenity-js/commit/2dfb44c5e3761be47e11528c3485fedf2600924f)), closes [#374](https://github.com/serenity-js/serenity-js/issues/374)





## [2.12.3](https://github.com/serenity-js/serenity-js/compare/v2.12.2...v2.12.3) (2020-07-14)


### Bug Fixes

* **protractor:** `Clear` can clear a value of an empty field ([6bd85ff](https://github.com/serenity-js/serenity-js/commit/6bd85ffc4d4a5169652cb8d1a5d743e47e9efcc2))





## [2.12.2](https://github.com/serenity-js/serenity-js/compare/v2.12.1...v2.12.2) (2020-07-08)


### Bug Fixes

* **mocha:** mark scenarios as retriable only if they are being retried ([c876263](https://github.com/serenity-js/serenity-js/commit/c876263daf79aafc97d1eb507850c5588174ff60))





## [2.12.1](https://github.com/serenity-js/serenity-js/compare/v2.12.0...v2.12.1) (2020-07-07)


### Bug Fixes

* **rest:** new interactions to ChangeApiConfig.setPortTo(..) and ChangeApiConfig.setUrlTo(..) ([28e8c28](https://github.com/serenity-js/serenity-js/commit/28e8c2891d74a8db12eddc24d2a38d1d3f408311))





# [2.12.0](https://github.com/serenity-js/serenity-js/compare/v2.11.4...v2.12.0) (2020-07-06)


### Features

* **core:** notes can be recorded under custom subject names ([b36ac73](https://github.com/serenity-js/serenity-js/commit/b36ac73423375cd6d89ac3292d624e0b5bdca61a)), closes [#586](https://github.com/serenity-js/serenity-js/issues/586)





## [2.11.4](https://github.com/serenity-js/serenity-js/compare/v2.11.3...v2.11.4) (2020-07-05)


### Bug Fixes

* **rest:** LastResponse.body() is now type-safe ([a936a1f](https://github.com/serenity-js/serenity-js/commit/a936a1f6b02657ebe81c23d3ad083dd94d60703f))





## [2.11.3](https://github.com/serenity-js/serenity-js/compare/v2.11.2...v2.11.3) (2020-07-05)


### Bug Fixes

* **core:** stageManager can be used to replay test suites from event logs for diagnostics ([cb051b8](https://github.com/serenity-js/serenity-js/commit/cb051b8b09db70a846b6231ebfc5d3db04e097b5))
* **serenity-bdd:** serenityBDDReporter reports events that occured in Mocha's before and after hooks ([a8e0ccb](https://github.com/serenity-js/serenity-js/commit/a8e0ccb20aa4bd8fed4c63816b4a09254fa09c24))





## [2.11.2](https://github.com/serenity-js/serenity-js/compare/v2.11.1...v2.11.2) (2020-07-04)


### Bug Fixes

* **local-server:** corrected issue where local server could come back on a random port after restart ([32f18b9](https://github.com/serenity-js/serenity-js/commit/32f18b9dbd2278e0874635f7be9727aa0b90a6ae)), closes [sindresorhus/get-port#43](https://github.com/sindresorhus/get-port/issues/43)
* **mocha:** correctly handle events emitted in `before` hook ([fb3e549](https://github.com/serenity-js/serenity-js/commit/fb3e549fd7038de9cde28d0eb2309e56a7062c22))
* **serenity-bdd:** serenityBDD reporter ignores any events that happen outside of the test ([bb3b027](https://github.com/serenity-js/serenity-js/commit/bb3b027b9b1aa3f4024dcadeb8df1483d5e18906))





## [2.11.1](https://github.com/serenity-js/serenity-js/compare/v2.11.0...v2.11.1) (2020-06-30)


### Bug Fixes

* **serenity-bdd:** changed the default location of the cache directory so that npm doesn't prune it ([54d6dd4](https://github.com/serenity-js/serenity-js/commit/54d6dd4eb9c380c8fa917ffc4f2f23f98c9afcba)), closes [npm/npm#16853](https://github.com/npm/npm/issues/16853)





# [2.11.0](https://github.com/serenity-js/serenity-js/compare/v2.10.3...v2.11.0) (2020-06-20)


### Bug Fixes

* **docs:** documented changes to Target.of in the Serenity/JS 2.0 upgrade guide ([43bec7b](https://github.com/serenity-js/serenity-js/commit/43bec7b86d16f977bcd059d271cae76bab81171d)), closes [#598](https://github.com/serenity-js/serenity-js/issues/598)
* **docs:** updated Serenity/JS 2.0 upgrade guide to explain how to use Mocha ([3cdd74c](https://github.com/serenity-js/serenity-js/commit/3cdd74c75e4ddc97889cfba1c57a1636d1d48e94))
* **serenity-bdd:** default Serenity BDD CLI to generating short filenames for the HTML report ([50c649d](https://github.com/serenity-js/serenity-js/commit/50c649d34fbe31f7129527a0aadca39e51e67543))
* **serenity-bdd:** moved core, assertions and rest from peerDependencies to dependencies ([966b20a](https://github.com/serenity-js/serenity-js/commit/966b20a7abf63a94463edd0f6313be3f995e0690))


### Features

* **mocha:** support for retrying failed scenarios ([2ff755b](https://github.com/serenity-js/serenity-js/commit/2ff755b4fa395ae412f4b250c3ba924a1337438c)), closes [#101](https://github.com/serenity-js/serenity-js/issues/101)
* **protractor:** support for using Mocha with Protractor ([ae5bd7e](https://github.com/serenity-js/serenity-js/commit/ae5bd7efe780894c07451edec030d156c16aa8fa))





## [2.10.3](https://github.com/serenity-js/serenity-js/compare/v2.10.2...v2.10.3) (2020-06-15)


### Bug Fixes

* **deps:** updated Mocha to 8.x ([ad5fa66](https://github.com/serenity-js/serenity-js/commit/ad5fa66fd12971202ffc5ad65ca44e7cb2e21ddd))
* **serenity-bdd:** browser and platform context icons show up correctly in scenario outline reports ([a685afc](https://github.com/serenity-js/serenity-js/commit/a685afccf4436b8ed5e9259d3aad3e4fee5f0f39)), closes [#597](https://github.com/serenity-js/serenity-js/issues/597)





## [2.10.2](https://github.com/serenity-js/serenity-js/compare/v2.10.1...v2.10.2) (2020-06-11)

**Note:** Version bump only for package serenity-js-monorepo





## [2.10.1](https://github.com/serenity-js/serenity-js/compare/v2.10.0...v2.10.1) (2020-06-10)


### Bug Fixes

* **docs:** documented Cucumber configuration better ([04ed39a](https://github.com/serenity-js/serenity-js/commit/04ed39a9d0902da9ab94c938e83a7e021377e678))
* **local-server:** addressed a possible EventEmitter memory leak when restarting the local server ([1c0bec7](https://github.com/serenity-js/serenity-js/commit/1c0bec757b27078ba451d402a46485b4a40b735d))
* **protractor:** photographer will not try to capture the screenshot if the actor has no browser ([f1491bf](https://github.com/serenity-js/serenity-js/commit/f1491bf979732c56d1b0f3734bad2c33106b0748))





# [2.10.0](https://github.com/serenity-js/serenity-js/compare/v2.9.0...v2.10.0) (2020-06-06)


### Bug Fixes

* **serenity-bdd:** corrected links to feature reports for non-Cucumber test suites ([7fce935](https://github.com/serenity-js/serenity-js/commit/7fce935cdfd64099cae9351dc98f99d0598396b0))


### Features

* **serenity-bdd:** updated Serenity BDD CLI to 2.1.11 ([c7cfd0d](https://github.com/serenity-js/serenity-js/commit/c7cfd0dfabd886b0cd66267f47282ffeb0cdcf0c))





# [2.9.0](https://github.com/serenity-js/serenity-js/compare/v2.8.1...v2.9.0) (2020-06-05)


### Features

* **serenity-bdd:** choose human-readable or short file names for your HTML reports ([1b19aee](https://github.com/serenity-js/serenity-js/commit/1b19aee87023e84fd85e65cb93f8ea65e5c95f92))
* **serenity-bdd:** support for internal repositories that require authentication ([c14ac29](https://github.com/serenity-js/serenity-js/commit/c14ac29c3fd6257763f26201357721b1a04c72d5))





## [2.8.1](https://github.com/serenity-js/serenity-js/compare/v2.8.0...v2.8.1) (2020-06-02)


### Bug Fixes

* **serenity-bdd:** fixed issue with screenshots appearing out of order in the slideshow view ([a036605](https://github.com/serenity-js/serenity-js/commit/a036605fd226e0796821fa164da0460b697aa2e4)), closes [#582](https://github.com/serenity-js/serenity-js/issues/582)





# [2.8.0](https://github.com/serenity-js/serenity-js/compare/v2.7.0...v2.8.0) (2020-06-02)


### Features

* **serenity-bdd:** support for artifact repositories using local repository names ([523995b](https://github.com/serenity-js/serenity-js/commit/523995b82e6b7eedf635fb118336886125581f5d))





# [2.7.0](https://github.com/serenity-js/serenity-js/compare/v2.6.0...v2.7.0) (2020-06-01)


### Bug Fixes

* **mocha:** corrected AssertionError reporting on Node 10 ([9c2d94b](https://github.com/serenity-js/serenity-js/commit/9c2d94b46524629b6711daf2e33331dbf68f7362))


### Features

* **mocha:** serenity/JS adapter for Mocha ([f4f0f68](https://github.com/serenity-js/serenity-js/commit/f4f0f680571540f2654e53e1587eb50f01d07ecc))





# [2.6.0](https://github.com/serenity-js/serenity-js/compare/v2.5.5...v2.6.0) (2020-05-27)


### Features

* **assertions:** adding assertions isTrue() and isFalse() ([9c4c036](https://github.com/serenity-js/serenity-js/commit/9c4c036fcd9dd328aa3fd0ba0d84c7503f4c21c8))





## [2.5.5](https://github.com/serenity-js/serenity-js/compare/v2.5.4...v2.5.5) (2020-05-25)


### Bug Fixes

* **jasmine:** fixed a potential synchronisation issue ([3c1b6e6](https://github.com/serenity-js/serenity-js/commit/3c1b6e6dee5dfe0fd053e385ba9b59426e9ba8ed))





## [2.5.4](https://github.com/serenity-js/serenity-js/compare/v2.5.3...v2.5.4) (2020-05-22)

**Note:** Version bump only for package serenity-js-monorepo





## [2.5.3](https://github.com/serenity-js/serenity-js/compare/v2.5.2...v2.5.3) (2020-05-21)

**Note:** Version bump only for package serenity-js-monorepo





## [2.5.2](https://github.com/serenity-js/serenity-js/compare/v2.5.1...v2.5.2) (2020-05-16)

**Note:** Version bump only for package serenity-js-monorepo





## [2.5.1](https://github.com/serenity-js/serenity-js/compare/v2.5.0...v2.5.1) (2020-05-16)


### Bug Fixes

* **protractor:** support for Protractor 7.0.0 ([cf7518a](https://github.com/serenity-js/serenity-js/commit/cf7518a848e0204b67c1ebeb3b8e2200cd0a6ad8))





# [2.5.0](https://github.com/serenity-js/serenity-js/compare/v2.4.1...v2.5.0) (2020-05-14)


### Bug Fixes

* **npm:** esport ES2018 instead of ES5 since we're supporting Node >= 10 ([a77091a](https://github.com/serenity-js/serenity-js/commit/a77091aa779736172a60b6ac99ec1b869aaea816))


### Features

* **core:** discardable Abilities and shared notes ([6cc2e2c](https://github.com/serenity-js/serenity-js/commit/6cc2e2c936e20004f3e542e51f9fec602eba9093))





## [2.4.1](https://github.com/serenity-js/serenity-js/compare/v2.4.0...v2.4.1) (2020-05-03)

**Note:** Version bump only for package serenity-js-monorepo





# [2.4.0](https://github.com/serenity-js/serenity-js/compare/v2.3.6...v2.4.0) (2020-05-02)


### Bug Fixes

* **core:** plain JavaScript/JSON object are now pretty-printed to make them easier to read ([c63d64d](https://github.com/serenity-js/serenity-js/commit/c63d64de689ed7194b8fce9c65aa1a896d1728de)), closes [#509](https://github.com/serenity-js/serenity-js/issues/509)


### Features

* **protractor:** navigate.to(url).withTimeout(duration) ([be23c6e](https://github.com/serenity-js/serenity-js/commit/be23c6e4f2a00edad01a9c9ecc1734ec2eda4f4a)), closes [#517](https://github.com/serenity-js/serenity-js/issues/517)





## [2.3.6](https://github.com/serenity-js/serenity-js/compare/v2.3.5...v2.3.6) (2020-04-28)


### Bug Fixes

* **core:** an Actor will now complain if given the same ability more than once ([d34f4d5](https://github.com/serenity-js/serenity-js/commit/d34f4d58ed44c764fd9b516a007330c01cb7cbf5))





## [2.3.5](https://github.com/serenity-js/serenity-js/compare/v2.3.4...v2.3.5) (2020-04-28)


### Bug Fixes

* **console-reporter:** corrected an issue that might be causing an OOM error ([0b60511](https://github.com/serenity-js/serenity-js/commit/0b60511a274d58155361cbc636c03dda857b57d0)), closes [#550](https://github.com/serenity-js/serenity-js/issues/550)





## [2.3.4](https://github.com/serenity-js/serenity-js/compare/v2.3.3...v2.3.4) (2020-04-22)

**Note:** Version bump only for package serenity-js-monorepo





## [2.3.3](https://github.com/serenity-js/serenity-js/compare/v2.3.2...v2.3.3) (2020-04-22)


### Bug Fixes

* **protractor:** cleaned up the API docs and introduced interfaces to simplify method signatures ([8e85a54](https://github.com/serenity-js/serenity-js/commit/8e85a54452dfb79ca04d94fa1d81e295be2be3ae))





## [2.3.2](https://github.com/serenity-js/serenity-js/compare/v2.3.1...v2.3.2) (2020-04-08)


### Bug Fixes

* **deps:** updated TSLint and fixed some minor code style issues ([f43fd14](https://github.com/serenity-js/serenity-js/commit/f43fd14e11e2582aaa0d7cb3c186e0a58874a7fc))





## [2.3.1](https://github.com/serenity-js/serenity-js/compare/v2.3.0...v2.3.1) (2020-04-07)


### Bug Fixes

* **deps:** updated dependencies ([67401a7](https://github.com/serenity-js/serenity-js/commit/67401a774582386be02178e077b918a481630950))
* **node:** dropping support for Node.js 8 since it has reached end of life (EOL) ([c61c3d2](https://github.com/serenity-js/serenity-js/commit/c61c3d2c50fa212d460f31a29c20145f111ab731))





# [2.3.0](https://github.com/serenity-js/serenity-js/compare/v2.2.2...v2.3.0) (2020-03-15)


### Features

* **serenity-bdd:** context icons for browsers and platforms ([65ccab0](https://github.com/serenity-js/serenity-js/commit/65ccab070d12c1d6d3f9067e3737e4c246bdbff0)), closes [#455](https://github.com/serenity-js/serenity-js/issues/455)
* **serenity-bdd:** one-way integration with jira and other issue trackers ([318abbb](https://github.com/serenity-js/serenity-js/commit/318abbbec5f6a99be3c9b8d3aa960ae05de9f8f4)), closes [#189](https://github.com/serenity-js/serenity-js/issues/189)





## [2.2.2](https://github.com/serenity-js/serenity-js/compare/v2.2.1...v2.2.2) (2020-03-08)

**Note:** Version bump only for package serenity-js-monorepo





## [2.2.1](https://github.com/serenity-js/serenity-js/compare/v2.2.0...v2.2.1) (2020-03-04)


### Bug Fixes

* **deps:** updated dependencies ([6bf777a](https://github.com/serenity-js/serenity-js/commit/6bf777a0754f31d666bfcaae3ad2d6fc79aba8a6))





# [2.2.0](https://github.com/serenity-js/serenity-js/compare/v2.1.5...v2.2.0) (2020-02-17)


### Features

* **protractor:** expectation to check if an element isActive() ([bb7f6c5](https://github.com/serenity-js/serenity-js/commit/bb7f6c58e481b37793123ce0ba2ff1177240ba8b))





## [2.1.5](https://github.com/serenity-js/serenity-js/compare/v2.1.4...v2.1.5) (2020-02-10)

**Note:** Version bump only for package serenity-js-monorepo





## [2.1.4](https://github.com/serenity-js/serenity-js/compare/v2.1.3...v2.1.4) (2020-02-10)

**Note:** Version bump only for package serenity-js-monorepo





## [2.1.3](https://github.com/serenity-js/serenity-js/compare/v2.1.2...v2.1.3) (2020-02-10)

**Note:** Version bump only for package serenity-js-monorepo





## [2.1.2](https://github.com/serenity-js/serenity-js/compare/v2.1.1...v2.1.2) (2020-02-08)


### Bug Fixes

* **protractor:** distinguish between regular and 'mobile emulation' test runs ([fcd7101](https://github.com/serenity-js/serenity-js/commit/fcd7101939fddd855f45aa99b75e309b382b6b73)), closes [#323](https://github.com/serenity-js/serenity-js/issues/323)





## [2.1.1](https://github.com/serenity-js/serenity-js/compare/v2.1.0...v2.1.1) (2020-02-08)


### Bug Fixes

* **protractor:** detect the browser name and version, as well as the platform name and version ([9965918](https://github.com/serenity-js/serenity-js/commit/99659187b99bb2d97f8cc51910a4f12f2685875c)), closes [#455](https://github.com/serenity-js/serenity-js/issues/455)





# [2.1.0](https://github.com/serenity-js/serenity-js/compare/v2.0.9...v2.1.0) (2020-02-07)


### Bug Fixes

* **local-server:** startLocalServer will throw a ConfigurationError if the server was not started ([c71f0a1](https://github.com/serenity-js/serenity-js/commit/c71f0a16db235c23a41be2186356cdb21dc80221))


### Features

* **protractor:** browser tags include browser version and platform name ([bc4a038](https://github.com/serenity-js/serenity-js/commit/bc4a038484f75e90e44c5399c43213b472e71f38)), closes [#132](https://github.com/serenity-js/serenity-js/issues/132)





## [2.0.9](https://github.com/serenity-js/serenity-js/compare/v2.0.8...v2.0.9) (2020-02-05)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.8](https://github.com/serenity-js/serenity-js/compare/v2.0.7...v2.0.8) (2020-02-05)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.7](https://github.com/serenity-js/serenity-js/compare/v2.0.6...v2.0.7) (2020-02-05)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.6](https://github.com/serenity-js/serenity-js/compare/v2.0.5...v2.0.6) (2020-02-05)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.5](https://github.com/serenity-js/serenity-js/compare/v2.0.4...v2.0.5) (2020-02-04)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.4](https://github.com/serenity-js/serenity-js/compare/v2.0.3...v2.0.4) (2020-02-04)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.3](https://github.com/serenity-js/serenity-js/compare/v2.0.2...v2.0.3) (2020-02-04)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.2](https://github.com/serenity-js/serenity-js/compare/v2.0.1...v2.0.2) (2020-02-04)


### Bug Fixes

* **console-reporter:** advises the developer if they've instantiated the reporter incorrectly ([5709e76](https://github.com/serenity-js/serenity-js/commit/5709e76c7a97273f21b122f90c21fd8e8d3e1389)), closes [#413](https://github.com/serenity-js/serenity-js/issues/413)
* **console-reporter:** corrected the padding on longer category names ([d193b7d](https://github.com/serenity-js/serenity-js/commit/d193b7d7d611cfc81b10a491554e1fa12e8d6418)), closes [#375](https://github.com/serenity-js/serenity-js/issues/375)





## [2.0.1](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.132...v2.0.1) (2020-02-03)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.132](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.131...v2.0.1-alpha.132) (2020-02-03)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.131](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.130...v2.0.1-alpha.131) (2020-02-03)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.130](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.129...v2.0.1-alpha.130) (2020-02-03)


### Bug Fixes

* **protractor:** updated dev dependency on Protractor ([736bf54](https://github.com/serenity-js/serenity-js/commit/736bf54aea5d79eaec5dd1e8e9a70d2fbaa035ce))





## [2.0.1-alpha.129](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.128...v2.0.1-alpha.129) (2020-02-02)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.128](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.127...v2.0.1-alpha.128) (2020-02-02)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.127](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.126...v2.0.1-alpha.127) (2020-02-02)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.126](https://github.com/serenity-js/serenity-js/compare/v2.0.1-alpha.125...v2.0.1-alpha.126) (2020-02-02)


### Bug Fixes

* **deps:** updated the dependency on lodash to avoid the npm audit warning ([db2cf3e](https://github.com/serenity-js/serenity-js/commit/db2cf3ea8b30eaf6b6df851eb19e42beb84a8811)), closes [#364](https://github.com/serenity-js/serenity-js/issues/364)
* **npm:** corrected the repo URL after the jan-molak -> serenity-js repo  migration ([a451199](https://github.com/serenity-js/serenity-js/commit/a4511995c50bf08977aa6c4c0f5d22ba7ead343f))





## [2.0.1-alpha.125](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.124...v2.0.1-alpha.125) (2020-02-02)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.124](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.123...v2.0.1-alpha.124) (2020-02-02)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.123](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.122...v2.0.1-alpha.123) (2020-02-02)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.122](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.121...v2.0.1-alpha.122) (2020-02-02)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.121](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.120...v2.0.1-alpha.121) (2020-02-02)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.120](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.119...v2.0.1-alpha.120) (2020-02-02)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.119](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.118...v2.0.1-alpha.119) (2020-02-02)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.118](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.117...v2.0.1-alpha.118) (2020-02-01)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.117](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.116...v2.0.1-alpha.117) (2020-01-29)


### Bug Fixes

* **jasmine:** make Jasmine report the error stack trace correctly ([d5382bf](https://github.com/jan-molak/serenity-js/commit/d5382bf36ea0da2efb740f6fbbf3a98299cbb8d0))





## [2.0.1-alpha.116](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.115...v2.0.1-alpha.116) (2020-01-29)


### Bug Fixes

* **core:** actor throws ConfigurationError when it's not given the abilities needed to run the test ([d99ac88](https://github.com/jan-molak/serenity-js/commit/d99ac88b2024b70e1d0d16420613a0b941fc1a99))





## [2.0.1-alpha.115](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.114...v2.0.1-alpha.115) (2020-01-27)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.114](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.113...v2.0.1-alpha.114) (2020-01-27)


### Bug Fixes

* **serenity-bdd:** reports are correctly stored to disk ([c050e2f](https://github.com/jan-molak/serenity-js/commit/c050e2fef0952d530394304619b42ee692f31584))





## [2.0.1-alpha.113](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.112...v2.0.1-alpha.113) (2020-01-26)


### Bug Fixes

* **jasmine:** report scenarios with compromised interactions as compromised instead of broken ([f828f1f](https://github.com/jan-molak/serenity-js/commit/f828f1f08e333aba5c262580d7be10817217a374))





## [2.0.1-alpha.112](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.111...v2.0.1-alpha.112) (2020-01-25)


### Bug Fixes

* **core:** corrected the file location provided with the deprecation message ([170956d](https://github.com/jan-molak/serenity-js/commit/170956d90e24d87a7cb866c39173c386e2baed3d))





## [2.0.1-alpha.111](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.110...v2.0.1-alpha.111) (2020-01-25)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.110](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.109...v2.0.1-alpha.110) (2020-01-25)


### Features

* **core:** new APIs to make configuring and using Serenity/JS easier ([d11a80d](https://github.com/jan-molak/serenity-js/commit/d11a80de66519cb16b6eaa61a39694006a76b5fb))





## [2.0.1-alpha.109](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.108...v2.0.1-alpha.109) (2020-01-23)


### Bug Fixes

* **cucumber:** corrected synchronisation of async events ([d39bc7c](https://github.com/jan-molak/serenity-js/commit/d39bc7c1b8dcf09939d35f7c1d3144abb1e59453)), closes [#405](https://github.com/jan-molak/serenity-js/issues/405)
* **cucumber:** ensure async events are correctly synchronised before the test run finishes ([d69aeae](https://github.com/jan-molak/serenity-js/commit/d69aeae48524865f68a175d04ef800f5045b3712)), closes [#405](https://github.com/jan-molak/serenity-js/issues/405)
* **jasmine:** corrected synchronisation of async events ([38fd1c7](https://github.com/jan-molak/serenity-js/commit/38fd1c7ad5fc8396a8c2a4e9a68286cac7f033f7)), closes [#405](https://github.com/jan-molak/serenity-js/issues/405)
* **jasmine:** ensure async events are correctly synchronised before the test run finishes ([9b4e49a](https://github.com/jan-molak/serenity-js/commit/9b4e49ade65df6d73421e837229ca5c785b677e0)), closes [#405](https://github.com/jan-molak/serenity-js/issues/405)





## [2.0.1-alpha.108](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.107...v2.0.1-alpha.108) (2020-01-20)


### Bug Fixes

* **jasmine:** ensure Jasmine reporter waits for the async tasks to complete before exiting ([b6252ad](https://github.com/jan-molak/serenity-js/commit/b6252ad34f213bbc9e865a85db9e9af211bf9f4e))





## [2.0.1-alpha.107](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.106...v2.0.1-alpha.107) (2020-01-19)


### Bug Fixes

* **cucumber:** cucumber adapter waits for async tasks to complete before starting a scenario ([0ed2d4c](https://github.com/jan-molak/serenity-js/commit/0ed2d4c023f39857355eb98ff8311d0e5ed174dc)), closes [#56](https://github.com/jan-molak/serenity-js/issues/56)
* **jasmine:** ensure the async work queue is empty before the suite is marked as completed ([ad5a2b6](https://github.com/jan-molak/serenity-js/commit/ad5a2b67a8e2c22c530ea065cef541548d06f3d0)), closes [#56](https://github.com/jan-molak/serenity-js/issues/56)
* **protractor:** support restarting the browser between test scenarios ([21b5a41](https://github.com/jan-molak/serenity-js/commit/21b5a4187dbbc9babf70e75cda8b42e5e2531d17))





## [2.0.1-alpha.106](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.105...v2.0.1-alpha.106) (2020-01-19)


### Bug Fixes

* **local-server:** trying to access data of a server that's not running throws a meaningful error ([ff6d012](https://github.com/jan-molak/serenity-js/commit/ff6d012fd6e7c0b069a0afd3cc76250d8b828dfe))





## [2.0.1-alpha.105](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.104...v2.0.1-alpha.105) (2020-01-16)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.104](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.104) (2020-01-10)


### Bug Fixes

* **lerna:** fixed the versions, since lerna managed to mess them up again ([0e87048](https://github.com/jan-molak/serenity-js/commit/0e87048219dc17a0c64a1bbf6b12128b18e85718))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2020-01-10)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2020-01-10)


### Bug Fixes

* **local-server:** updated http-shutdown to the latest version ([b9afc8a](https://github.com/jan-molak/serenity-js/commit/b9afc8a380002d4cb43e1e9edb4056e0405b2e76)), closes [thedillonb/http-shutdown#18](https://github.com/thedillonb/http-shutdown/issues/18)





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2020-01-09)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2020-01-09)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2020-01-09)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-12-16)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-12-15)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-12-15)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-12-11)


### Bug Fixes

* **dependencies:** updated Lerna and corrected the versions that got out of sync ([6c2f3af](https://github.com/jan-molak/serenity-js/commit/6c2f3afe98207c9241b5a7df970ec94fa37f4f1d))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-12-11)


### Bug Fixes

* **protractor:** updated the version of Chromedriver ([f1c6a57](https://github.com/jan-molak/serenity-js/commit/f1c6a57))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-12-09)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-12-09)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-12-08)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-11-29)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-11-27)


### Bug Fixes

* **jasmine:** Corrected the source detection logic ([1e91f25](https://github.com/jan-molak/serenity-js/commit/1e91f25))
* **protractor:** Corrected the test runner detector ([e5e638b](https://github.com/jan-molak/serenity-js/commit/e5e638b))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-11-25)


### Bug Fixes

* **assertions:** Ensure correct 'actual' and 'expected' values are captured when an Expectation fail ([e503e55](https://github.com/jan-molak/serenity-js/commit/e503e55))
* **core:** ErrorSerialiser correctly interprets assertion errors reported by Jasmine ([55451da](https://github.com/jan-molak/serenity-js/commit/55451da))
* **jasmine:** Report AssertionErrors correctly ([5eae90b](https://github.com/jan-molak/serenity-js/commit/5eae90b))
* **jasmine:** Scenarios failed due to an AssertionError are marked as such ([da3eaa3](https://github.com/jan-molak/serenity-js/commit/da3eaa3))


### Features

* **console-reporter:** New and shiny ConsoleReporter module to replace the experimental ConsoleRepo ([689937d](https://github.com/jan-molak/serenity-js/commit/689937d))
* **serenity-bdd:** AssertionErrors are reported together with a diff of actual/expected ([6b7a55e](https://github.com/jan-molak/serenity-js/commit/6b7a55e))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-11-10)


### Bug Fixes

* **protractor:** Names of artifacts produced during the test run are easier to distinguish ([da91e93](https://github.com/jan-molak/serenity-js/commit/da91e93)), closes [#132](https://github.com/jan-molak/serenity-js/issues/132)





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-11-09)


### Features

* **protractor:** TakeScreenshot allows the actor to capture screenshots at any point during the sce ([1d07075](https://github.com/jan-molak/serenity-js/commit/1d07075))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-10-13)


### Bug Fixes

* **core:** Dropped support for node 6 ([74d1ece](https://github.com/jan-molak/serenity-js/commit/74d1ece))


### Features

* **cucumber:** Support for Cucumber 6 ([b437edd](https://github.com/jan-molak/serenity-js/commit/b437edd))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-09-24)


### Bug Fixes

* **protractor:** The Clear interaction willl complain if used with an element that cannot be cleared ([f7908a8](https://github.com/jan-molak/serenity-js/commit/f7908a8))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-09-23)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-09-22)


### Bug Fixes

* **jasmine:** Corrected how the scenario titles are constructed ([725246e](https://github.com/jan-molak/serenity-js/commit/725246e))
* **protractor:** Added an interaction to Hover.over(target), corrected the DoubleClick interaction s ([13e480f](https://github.com/jan-molak/serenity-js/commit/13e480f))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-09-16)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-09-05)


### Bug Fixes

* **core:** Handle Windows EACCES errors correctly ([491499e](https://github.com/jan-molak/serenity-js/commit/491499e))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-09-01)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-09-01)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-09-01)


### Features

* **protractor:** Photographer.whoWill(..) factory method to make instantiation of the Photographer ([2880116](https://github.com/jan-molak/serenity-js/commit/2880116)), closes [#335](https://github.com/jan-molak/serenity-js/issues/335)
* **serenity-bdd:** "serenity-bdd run" command can be configured with "--log" to specify the amount ([05cd487](https://github.com/jan-molak/serenity-js/commit/05cd487))
* **serenity-bdd:** Extracted the SerenityBDDReporter into a separate module ([fe7cfca](https://github.com/jan-molak/serenity-js/commit/fe7cfca))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-08-05)


### Bug Fixes

* **core:** Renamed Log.info(answerable) to Log.the(answerable), since it's all getting logged to std out anyway. ([8705efd](https://github.com/jan-molak/serenity-js/commit/8705efd))
* **core:** Renamed Log.info(answerable) to Log.the(answerable), since it's all getting logged to std out anyway. ([5290c8b](https://github.com/jan-molak/serenity-js/commit/5290c8b))


### Features

* **core:** The ability to TakeNotes and the associated TakeNote.of(question), which makes the Actor remember the answer to a question and Note.of(question), which makes the Actor retrieve the remembered value. ([a0e7f99](https://github.com/jan-molak/serenity-js/commit/a0e7f99)), closes [#318](https://github.com/jan-molak/serenity-js/issues/318)





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-07-16)


### Features

* **protractor:** Wait.until(expectation) fails with an AssertionError if the expectation is not met ([bfff8d6](https://github.com/jan-molak/serenity-js/commit/bfff8d6))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-07-07)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-06-24)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-06-23)


### Bug Fixes

* **core:** Fixed serialisation logic of ArtifactArchived and ActivityRelatedArtifactArchived ([58d4536](https://github.com/jan-molak/serenity-js/commit/58d4536))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-06-23)


### Features

* **core:** The new StreamReporter helps to analyse issues that have occurred at runtime ([f96f9f8](https://github.com/jan-molak/serenity-js/commit/f96f9f8))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-06-22)


### Bug Fixes

* **core:** DebugReporter prints domain events serialised as ndjson ([076587e](https://github.com/jan-molak/serenity-js/commit/076587e))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-06-20)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-05-28)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-05-27)


### Features

* **protractor:** Jasmine adapter for Protractor ([97bf841](https://github.com/jan-molak/serenity-js/commit/97bf841))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-05-23)


### Bug Fixes

* **core:** WithStage moved to @serenity-js/core ([30184f8](https://github.com/jan-molak/serenity-js/commit/30184f8))
* **cucumber:** Simplified how the Serenity/JS listener is registered ([b0e52c2](https://github.com/jan-molak/serenity-js/commit/b0e52c2))
* **jasmine:** Jasmine scenarios synchronise with Serenity/JS ([42c28a6](https://github.com/jan-molak/serenity-js/commit/42c28a6))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-05-14)


### Features

* **jasmine:** Serenity reporter for Jasmine ([afff01a](https://github.com/jan-molak/serenity-js/commit/afff01a))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-05-02)


### Bug Fixes

* **core:** StageCrewMembers are now exported directly from @serenity-js/core ([e476d53](https://github.com/jan-molak/serenity-js/commit/e476d53))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-05-01)


### Features

* **assertions:** Expectation aliases via Expectation.to(description).soThatActual(expectation) ([d4b8c48](https://github.com/jan-molak/serenity-js/commit/d4b8c48))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-05-01)


### Features

* **core:** ArtifactArchiver can be instantiated using a convenient factory method ([6716f5f](https://github.com/jan-molak/serenity-js/commit/6716f5f))
* **protractor:** Report directory can be configured in protractor.conf.js ([e46f7ec](https://github.com/jan-molak/serenity-js/commit/e46f7ec)), closes [#45](https://github.com/jan-molak/serenity-js/issues/45)





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-29)


### Bug Fixes

* **cucumber:** Corrected how scenario and feature-level [@issue](https://github.com/issue) and [@issues](https://github.com/issues) tags are reported ([2563c5a](https://github.com/jan-molak/serenity-js/commit/2563c5a))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-29)


### Features

* **protractor:** Browser.log() allows the actor to read the browser log entries ([2a088b7](https://github.com/jan-molak/serenity-js/commit/2a088b7))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-29)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-26)


### Features

* **assertions:** Ensure reports the actual value if the expectation is not met ([4d00be3](https://github.com/jan-molak/serenity-js/commit/4d00be3))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-25)


### Bug Fixes

* **ci:** Corrected the version numbers ([5e97d35](https://github.com/jan-molak/serenity-js/commit/5e97d35))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-25)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-25)


### Bug Fixes

* **cucumber:** Scenario outlines are reported sans the cucumber hooks, as they added no value in thi ([899e496](https://github.com/jan-molak/serenity-js/commit/899e496))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-24)


### Bug Fixes

* **cucumber:** Corrected how feature file paths are compared on Windows ([2635bed](https://github.com/jan-molak/serenity-js/commit/2635bed))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-24)


### Bug Fixes

* **cucumber:** Consider scenarios with no non-hook steps to be pending implementation ([a7484d6](https://github.com/jan-molak/serenity-js/commit/a7484d6))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-24)


### Features

* **cucumber:** Scenarios with no steps are marked as pending implementation ([e3d838b](https://github.com/jan-molak/serenity-js/commit/e3d838b))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-23)


### Bug Fixes

* **cucumber:** Corrected how steps are reported for scenarios that use before/after hooks ([6563309](https://github.com/jan-molak/serenity-js/commit/6563309)), closes [cucumber/cucumber-js#1195](https://github.com/cucumber/cucumber-js/issues/1195)





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.103) (2019-04-18)


### Features

* **assertions:** Ensure can embed the assertion error in any custom RuntimeError ([e18d331](https://github.com/jan-molak/serenity-js/commit/e18d331))





## [2.0.1-alpha.103](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.103...v2.0.1-alpha.49) (2019-04-17)


### Features

* **protractor:** ProtractorFrameworkAdapter for Cucumber ([7474dbb](https://github.com/jan-molak/serenity-js/commit/7474dbb))





## [2.0.1-alpha.48](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.47...v2.0.1-alpha.48) (2019-04-11)


### Bug Fixes

* **core:** Corrected the RuntimeError class so that the name of the constructor is present in the st ([0d2164d](https://github.com/jan-molak/serenity-js/commit/0d2164d))
* **local-server:** Fixed the issue with the local server not getting stopped correctly ([9b0ea01](https://github.com/jan-molak/serenity-js/commit/9b0ea01))


### Features

* **core:** Transform allows for transforming an answer to a question ([082adeb](https://github.com/jan-molak/serenity-js/commit/082adeb))
* **local-server:** Support for testing HTTPS servers ([569d1bc](https://github.com/jan-molak/serenity-js/commit/569d1bc))
* **protractor:** Support for testing cookies ([15e043b](https://github.com/jan-molak/serenity-js/commit/15e043b))





## [2.0.1-alpha.47](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.46...v2.0.1-alpha.47) (2019-04-07)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.46](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.45...v2.0.1-alpha.46) (2019-04-05)


### Bug Fixes

* **core:** Reverted the peerDependencies change as Lerna can't support it ([e27f55f](https://github.com/jan-molak/serenity-js/commit/e27f55f))





## [2.0.1-alpha.45](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.44...v2.0.1-alpha.45) (2019-04-05)


### Bug Fixes

* **core:** Made all [@serenity-js](https://github.com/serenity-js) packages rely on a fixed version of [@serenity-js](https://github.com/serenity-js)/core ([9955a34](https://github.com/jan-molak/serenity-js/commit/9955a34))





## [2.0.1-alpha.44](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.43...v2.0.1-alpha.44) (2019-04-04)


### Features

* **core:** Serenity/JS reports are compatible with Serenity BDD CLI 2.1.8 ([aea17de](https://github.com/jan-molak/serenity-js/commit/aea17de))





## [2.0.1-alpha.43](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.42...v2.0.1-alpha.43) (2019-04-01)


### Bug Fixes

* **core:** Ensure tags are reported in a format understood by Serenity BDD ([6c4315c](https://github.com/jan-molak/serenity-js/commit/6c4315c))


### Features

* **core:** Actor.named('name') allows for instantiating an Actor without explicitly providing the S ([581a6ba](https://github.com/jan-molak/serenity-js/commit/581a6ba))





## [2.0.1-alpha.42](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.41...v2.0.1-alpha.42) (2019-03-29)


### Bug Fixes

* **core:** Fixed the report id generation algorithm to ensure compatibility with Serenity BDD ([f243613](https://github.com/jan-molak/serenity-js/commit/f243613))





## [2.0.1-alpha.41](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.40...v2.0.1-alpha.41) (2019-03-28)


### Bug Fixes

* **core:** Serenity object configures the Stage correctly ([438fa4c](https://github.com/jan-molak/serenity-js/commit/438fa4c))





## [2.0.1-alpha.40](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.39...v2.0.1-alpha.40) (2019-03-26)


### Bug Fixes

* **protractor:** Correctly correlate screenshots with activities they are concerning ([f71ea88](https://github.com/jan-molak/serenity-js/commit/f71ea88))





## [2.0.1-alpha.39](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.38...v2.0.1-alpha.39) (2019-03-26)


### Bug Fixes

* **core:** ArtifactArchiver ensures that the file name works on Windows too ([7832f0d](https://github.com/jan-molak/serenity-js/commit/7832f0d))





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


### Features

* **core:** Tasks and Interactions emit more precise domain events ([d18e55f](https://github.com/jan-molak/serenity-js/commit/d18e55f))





## [2.0.1-alpha.34](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.33...v2.0.1-alpha.34) (2019-03-18)


### Bug Fixes

* **local-server:** More readable API for the ManageALocalServer ability ([5dfe0e5](https://github.com/jan-molak/serenity-js/commit/5dfe0e5))





## [2.0.1-alpha.33](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.32...v2.0.1-alpha.33) (2019-03-14)


### Bug Fixes

* **protractor:** Corrected the interface of LastScriptExecution.result ([09ccdb0](https://github.com/jan-molak/serenity-js/commit/09ccdb0))





## [2.0.1-alpha.32](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.31...v2.0.1-alpha.32) (2019-03-13)


### Features

* **assertions:** isBefore, isAfter and containItemsWhereEachItem expectations ([db6e465](https://github.com/jan-molak/serenity-js/commit/db6e465))





## [2.0.1-alpha.31](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.30...v2.0.1-alpha.31) (2019-03-07)


### Bug Fixes

* **assertions:** wordsmithing ([bd13c4d](https://github.com/jan-molak/serenity-js/commit/bd13c4d))





## [2.0.1-alpha.30](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.29...v2.0.1-alpha.30) (2019-03-07)


### Features

* **assertions:** containAtLeastOneThat(expectation) ([dec5618](https://github.com/jan-molak/serenity-js/commit/dec5618))





## [2.0.1-alpha.29](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.28...v2.0.1-alpha.29) (2019-03-06)


### Features

* **protractor:** UseAngular.disableSynchronisation and enableSynchronisation ([0d420c5](https://github.com/jan-molak/serenity-js/commit/0d420c5))





## [2.0.1-alpha.28](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.27...v2.0.1-alpha.28) (2019-03-06)


### Features

* **assertions:** property(name, expectation) allows to assert on a property of an object ([feaaf79](https://github.com/jan-molak/serenity-js/commit/feaaf79))





## [2.0.1-alpha.27](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.26...v2.0.1-alpha.27) (2019-03-05)


### Features

* **protractor:** Scroll.to interaction ([9d20924](https://github.com/jan-molak/serenity-js/commit/9d20924))





## [2.0.1-alpha.26](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.25...v2.0.1-alpha.26) (2019-03-05)


### Bug Fixes

* **core:** Ensure the `reportData` entries in the report are compatible with Serenity BDD CLI ([95afc5a](https://github.com/jan-molak/serenity-js/commit/95afc5a))





## [2.0.1-alpha.25](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.24...v2.0.1-alpha.25) (2019-03-04)


### Features

* **protractor:** LastScriptExecution.result() gives access to the value returned by the script pass ([75acc79](https://github.com/jan-molak/serenity-js/commit/75acc79))





## [2.0.1-alpha.24](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.23...v2.0.1-alpha.24) (2019-03-02)


### Bug Fixes

* **protractor:** `target` package renamed to `targets` so that it's correctly included in git and np ([0d1ea52](https://github.com/jan-molak/serenity-js/commit/0d1ea52))





## [2.0.1-alpha.23](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.22...v2.0.1-alpha.23) (2019-03-02)


### Bug Fixes

* **core:** Test reports no longer contain a duplicate entry for with the contents of the report ([2c36962](https://github.com/jan-molak/serenity-js/commit/2c36962))
* **protractor:** Corrected the signatures of factory methods on Target to allow nesting of targets ([c4efd31](https://github.com/jan-molak/serenity-js/commit/c4efd31))


### Features

* **protractor:** ExecuteScript interactions and cleanup of the package structure ([753d511](https://github.com/jan-molak/serenity-js/commit/753d511))





## [2.0.1-alpha.22](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.21...v2.0.1-alpha.22) (2019-02-27)


### Bug Fixes

* **protractor:** Ensure Protractor ElementFinder is never wrapped in a promise as that makes it fail ([c7994dd](https://github.com/jan-molak/serenity-js/commit/c7994dd))


### Features

* **core:** toString method of Screenplay classes prints the name of the function ([f3d738e](https://github.com/jan-molak/serenity-js/commit/f3d738e))
* **protractor:** Nestable Targets, relative Questions and improvements to Pick ([56ea633](https://github.com/jan-molak/serenity-js/commit/56ea633))





## [2.0.1-alpha.21](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.20...v2.0.1-alpha.21) (2019-02-21)


### Features

* **assertions:** Pick allows to filter the answers to a Question ([4307966](https://github.com/jan-molak/serenity-js/commit/4307966))
* **protractor:** Pick can be used with protractor questions and interactions ([6f7c5bd](https://github.com/jan-molak/serenity-js/commit/6f7c5bd))





## [2.0.1-alpha.20](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.19...v2.0.1-alpha.20) (2019-02-19)


### Bug Fixes

* **rest:** Providing an invalid Axios configuration results in a ConfigurationError instead of Logic ([ba9c3db](https://github.com/jan-molak/serenity-js/commit/ba9c3db))


### Features

* **protractor:** Targets can be nested within one another ([b8f95c8](https://github.com/jan-molak/serenity-js/commit/b8f95c8)), closes [#187](https://github.com/jan-molak/serenity-js/issues/187) [#143](https://github.com/jan-molak/serenity-js/issues/143)





## [2.0.1-alpha.19](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.18...v2.0.1-alpha.19) (2019-02-14)


### Bug Fixes

* **cucumber:** Compromised tests are now correctly reported ([cf49a75](https://github.com/jan-molak/serenity-js/commit/cf49a75))





## [2.0.1-alpha.18](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.17...v2.0.1-alpha.18) (2019-02-14)


### Bug Fixes

* **core:** `formatted` tag function correctly removes new line characters from the output ([41e9db3](https://github.com/jan-molak/serenity-js/commit/41e9db3))
* **core:** Serenity BDD reports errors with root causes correctly ([25222a9](https://github.com/jan-molak/serenity-js/commit/25222a9))


### Features

* **assertions:** Check.whether enables conditional flow ([abbac18](https://github.com/jan-molak/serenity-js/commit/abbac18))





## [2.0.1-alpha.17](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.16...v2.0.1-alpha.17) (2019-02-13)


### Bug Fixes

* **rest:** Descriptions of HTTPRequests are more human-friendly, and so is the description of the Lo ([2368eba](https://github.com/jan-molak/serenity-js/commit/2368eba))





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


### Bug Fixes

* **core:** AssertionErrors are correctly reported ([fc2a881](https://github.com/jan-molak/serenity-js/commit/fc2a881))





## [2.0.1-alpha.11](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.10...v2.0.1-alpha.11) (2019-02-05)


### Bug Fixes

* **cucumber:** AssertionErrors are reported as such ([7bd837d](https://github.com/jan-molak/serenity-js/commit/7bd837d))





## [2.0.1-alpha.10](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.9...v2.0.1-alpha.10) (2019-02-05)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.9](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.8...v2.0.1-alpha.9) (2019-02-05)


### Bug Fixes

* **core:** Path works on both Windows and *nix systems ([5ebb30b](https://github.com/jan-molak/serenity-js/commit/5ebb30b)), closes [#142](https://github.com/jan-molak/serenity-js/issues/142)
* **protractor:** Corrected how Text.of(Target) is represented in the reports ([ae91f95](https://github.com/jan-molak/serenity-js/commit/ae91f95))





## [2.0.1-alpha.8](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.7...v2.0.1-alpha.8) (2019-02-04)

**Note:** Version bump only for package serenity-js-monorepo





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





## [2.0.1-alpha.3](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.2...v2.0.1-alpha.3) (2019-01-31)


### Bug Fixes

* **cucumber:** Compatibility with Cucumber.js 5.1 ([7cb7a9f](https://github.com/jan-molak/serenity-js/commit/7cb7a9f))





## [2.0.1-alpha.2](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.1...v2.0.1-alpha.2) (2019-01-31)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.1](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.0...v2.0.1-alpha.1) (2019-01-31)

**Note:** Version bump only for package serenity-js-monorepo





## [2.0.1-alpha.0](https://github.com/jan-molak/serenity-js/compare/v1.2.1...v2.0.1-alpha.0) (2019-01-31)


### Bug Fixes

* **browserstack:** increase default timeout to 30s to allow for the screenshots to be downloaded fro ([d0fa17e](https://github.com/jan-molak/serenity-js/commit/d0fa17e)), closes [#34](https://github.com/jan-molak/serenity-js/issues/34)
* **ci:** additional debug around releasing [@serenity-js](https://github.com/serenity-js)/core to npm ([125355d](https://github.com/jan-molak/serenity-js/commit/125355d))
* **core:** both the [@step](https://github.com/step) and Activity::toString can use an #actor token instead of {0} ([a1da923](https://github.com/jan-molak/serenity-js/commit/a1da923)), closes [#22](https://github.com/jan-molak/serenity-js/issues/22)
* **core:** bumped version of [@serenity-js](https://github.com/serenity-js)/core ([0901fc5](https://github.com/jan-molak/serenity-js/commit/0901fc5)), closes [#215](https://github.com/jan-molak/serenity-js/issues/215)
* **core:** check if stack trace is available before reading it ([0c87143](https://github.com/jan-molak/serenity-js/commit/0c87143)), closes [#84](https://github.com/jan-molak/serenity-js/issues/84)
* **core:** fixes maximum call stack size reached in [@step](https://github.com/step) ([1a8ad0f](https://github.com/jan-molak/serenity-js/commit/1a8ad0f)), closes [#38](https://github.com/jan-molak/serenity-js/issues/38)
* **core:** shorthand \`Question.where\` replaced by \`Question.about\` as \`where\` was both incorrect and ([46abbd3](https://github.com/jan-molak/serenity-js/commit/46abbd3))
* **core:** step annotation calls the method referenced in the template in a correct context ([d5f76fd](https://github.com/jan-molak/serenity-js/commit/d5f76fd))
* **cucumber:** a sequence of activities is correctly reported ([b66b266](https://github.com/jan-molak/serenity-js/commit/b66b266))
* **cucumber:** correctly hanlde --strict and --no-color flags ([878a165](https://github.com/jan-molak/serenity-js/commit/878a165))
* **cucumber:** empty feature files no longer cause a mapping error ([ba38f08](https://github.com/jan-molak/serenity-js/commit/ba38f08))
* **cucumber-2:** the cucumber-2 module is compatible with the updated serenity configuration format ([108d376](https://github.com/jan-molak/serenity-js/commit/108d376))
* **cucumber,mocha:** the stageCue timeout is configurable ([256d29b](https://github.com/jan-molak/serenity-js/commit/256d29b)), closes [#34](https://github.com/jan-molak/serenity-js/issues/34)
* **dependencies:** bumped [@serenity-js](https://github.com/serenity-js)/core ([b1c1721](https://github.com/jan-molak/serenity-js/commit/b1c1721))
* **dependencies:** bumped version of [@serenity-js](https://github.com/serenity-js)/core to bring in the updated Question.about interf ([6ea298d](https://github.com/jan-molak/serenity-js/commit/6ea298d))
* **deps:** serenity/JS depends on Lodash, but the dependency was missing from package.json ([5cf8dc1](https://github.com/jan-molak/serenity-js/commit/5cf8dc1)), closes [#184](https://github.com/jan-molak/serenity-js/issues/184)
* **deps:** the dependency on [@serenity-js](https://github.com/serenity-js)/core is a bit more explicit ([d4147fb](https://github.com/jan-molak/serenity-js/commit/d4147fb))
* **deps:** updated [@serenity-js](https://github.com/serenity-js)/core to 1.5.3 ([5a777f0](https://github.com/jan-molak/serenity-js/commit/5a777f0))
* **deps:** use serenity-js 1.2.5, which provides the new config class ([744ead5](https://github.com/jan-molak/serenity-js/commit/744ead5))
* **docs:** added missing README, LICENSE and NOTICE files to [@serenity-js](https://github.com/serenity-js)/cucumber-2 ([43197d1](https://github.com/jan-molak/serenity-js/commit/43197d1))
* **integration:** cleanup of TestFrameworkAdapter interfaces ([873c19c](https://github.com/jan-molak/serenity-js/commit/873c19c))
* **node version:** update the node version with >= 6.9.0 to support node v6.10.0 ([6867a90](https://github.com/jan-molak/serenity-js/commit/6867a90))
* **npm:** corrected the npm publish configuration ([fc7099d](https://github.com/jan-molak/serenity-js/commit/fc7099d))
* **protractor:** a Target's name can use the "{0}" token, same as the locator ([6a03291](https://github.com/jan-molak/serenity-js/commit/6a03291))
* **protractor:** corrected the Enter interaction so that the entered value is reported ([fe58c2a](https://github.com/jan-molak/serenity-js/commit/fe58c2a))
* **protractor:** executeScript and ExecuteAsyncScript will accept any type of arguments (not only Ta ([3778a32](https://github.com/jan-molak/serenity-js/commit/3778a32))
* **protractor:** hit interaction reports the name of the actor correctly ([bcf6151](https://github.com/jan-molak/serenity-js/commit/bcf6151))
* **protractor:** select.theValue() interaction is correctly reported ([06bca4a](https://github.com/jan-molak/serenity-js/commit/06bca4a))
* **protractor:** target.of() Dynamic selector accepts both string and number arguments ([a710f61](https://github.com/jan-molak/serenity-js/commit/a710f61)), closes [#93](https://github.com/jan-molak/serenity-js/issues/93)
* **reporting:** [@manual](https://github.com/manual) tags are correctly represented in the report ([babc587](https://github.com/jan-molak/serenity-js/commit/babc587)), closes [#67](https://github.com/jan-molak/serenity-js/issues/67)
* **reporting:** corrected promise and fs handling in SerenityBDDReporter/FileSystem ([6a36d94](https://github.com/jan-molak/serenity-js/commit/6a36d94))
* **reporting:** do not include the tags in the name of the json report if the scenario doesn't have ([1b0371e](https://github.com/jan-molak/serenity-js/commit/1b0371e))
* **reporting:** execution context of a scenario is considered when generating the scenario ID and na ([cd71d71](https://github.com/jan-molak/serenity-js/commit/cd71d71)), closes [#75](https://github.com/jan-molak/serenity-js/issues/75)
* **reporting:** stacktrace-js seems to not recognise the origin of the stack frame under some condit ([4827c9b](https://github.com/jan-molak/serenity-js/commit/4827c9b)), closes [#64](https://github.com/jan-molak/serenity-js/issues/64)
* **reporting:** support for Node 8.x ([eb9c458](https://github.com/jan-molak/serenity-js/commit/eb9c458)), closes [#122](https://github.com/jan-molak/serenity-js/issues/122)
* **reporting:** themes, Capabilities and Features are correctly tagged and appear in the report. ([9bbcf81](https://github.com/jan-molak/serenity-js/commit/9bbcf81)), closes [#75](https://github.com/jan-molak/serenity-js/issues/75) [#81](https://github.com/jan-molak/serenity-js/issues/81)
* **reporting:** wait.until(target, Is.present()) was incorrectly reported ([9fdbea0](https://github.com/jan-molak/serenity-js/commit/9fdbea0))
* **rest:** axios and serenity-js/core are now peerDependencies ([b1f98d5](https://github.com/jan-molak/serenity-js/commit/b1f98d5))
* **screenplay:** corrected the Actor class so that it compiles using the new TypeScript compiler ([a212ccb](https://github.com/jan-molak/serenity-js/commit/a212ccb)), closes [#105](https://github.com/jan-molak/serenity-js/issues/105)
* **screenplay:** corrected the return type expected by the Question interface ([58ed941](https://github.com/jan-molak/serenity-js/commit/58ed941)), closes [#57](https://github.com/jan-molak/serenity-js/issues/57)


### Features

* **adapters:** serenity/JS reporter for Mocha test framework ([1e0b4b4](https://github.com/jan-molak/serenity-js/commit/1e0b4b4)), closes [#95](https://github.com/jan-molak/serenity-js/issues/95)
* **assertions:** first draft of the [@serenity-js](https://github.com/serenity-js)/assertions module ([d1326b9](https://github.com/jan-molak/serenity-js/commit/d1326b9))
* **assertions:** new assertions ([bd6fc90](https://github.com/jan-molak/serenity-js/commit/bd6fc90))
* **assertions:** new assertions library ([71b16ea](https://github.com/jan-molak/serenity-js/commit/71b16ea))
* **ci:** corrected the version number ([9293490](https://github.com/jan-molak/serenity-js/commit/9293490))
* **config:** output directory is configurable ([03b2842](https://github.com/jan-molak/serenity-js/commit/03b2842)), closes [#45](https://github.com/jan-molak/serenity-js/issues/45)
* **core:** [@serenity-js](https://github.com/serenity-js)/core is independent of Protractor ([5dc4dd1](https://github.com/jan-molak/serenity-js/commit/5dc4dd1)), closes [#6](https://github.com/jan-molak/serenity-js/issues/6)
* **core:** [@serenity-js](https://github.com/serenity-js)/core published to npm ([3630da6](https://github.com/jan-molak/serenity-js/commit/3630da6))
* **core:** [@serenity](https://github.com/serenity)/core is no longer dependent on Protractor ([a935948](https://github.com/jan-molak/serenity-js/commit/a935948)), closes [#40](https://github.com/jan-molak/serenity-js/issues/40) [#6](https://github.com/jan-molak/serenity-js/issues/6)
* **core:** anonymous Tasks can be created using \`Task.where(description, ...sub-tasks)\` ([13f33cc](https://github.com/jan-molak/serenity-js/commit/13f33cc)), closes [#22](https://github.com/jan-molak/serenity-js/issues/22)
* **core:** arbitrary data can be attached to interactions reported in the test reports ([cd67a74](https://github.com/jan-molak/serenity-js/commit/cd67a74))
* **core:** conditional activities ([3883ece](https://github.com/jan-molak/serenity-js/commit/3883ece)), closes [#159](https://github.com/jan-molak/serenity-js/issues/159)
* **core:** consoleReporter prints to stdout and stderr by default ([0ea8f1e](https://github.com/jan-molak/serenity-js/commit/0ea8f1e))
* **core:** implemented the Stage ([ec5aa5d](https://github.com/jan-molak/serenity-js/commit/ec5aa5d))
* **core:** knownUnkowns - an Actor answers Questions and more! ([892ba7a](https://github.com/jan-molak/serenity-js/commit/892ba7a))
* **core:** re-write of [@serenity-js](https://github.com/serenity-js)/core ([0de381a](https://github.com/jan-molak/serenity-js/commit/0de381a)), closes [#156](https://github.com/jan-molak/serenity-js/issues/156) [#105](https://github.com/jan-molak/serenity-js/issues/105) [#162](https://github.com/jan-molak/serenity-js/issues/162)
* **core:** re-write of [@serenity-js](https://github.com/serenity-js)/core ([d83554a](https://github.com/jan-molak/serenity-js/commit/d83554a)), closes [#156](https://github.com/jan-molak/serenity-js/issues/156) [#105](https://github.com/jan-molak/serenity-js/issues/105) [#162](https://github.com/jan-molak/serenity-js/issues/162)
* **core:** sceneTagged event allows for the scene to be tagged with an arbitrary tag ([75208e1](https://github.com/jan-molak/serenity-js/commit/75208e1)), closes [#61](https://github.com/jan-molak/serenity-js/issues/61)
* **core:** support for Capability and Theme scenario tags ([76c165a](https://github.com/jan-molak/serenity-js/commit/76c165a))
* **core:** support for ES6-style task definitions ([fff470a](https://github.com/jan-molak/serenity-js/commit/fff470a)), closes [#22](https://github.com/jan-molak/serenity-js/issues/22) [#18](https://github.com/jan-molak/serenity-js/issues/18) [#21](https://github.com/jan-molak/serenity-js/issues/21) [#21](https://github.com/jan-molak/serenity-js/issues/21) [#22](https://github.com/jan-molak/serenity-js/issues/22)
* **cucumber:** [@serenity-js](https://github.com/serenity-js)/cucumber adapter re-write ([de8a565](https://github.com/jan-molak/serenity-js/commit/de8a565)), closes [#168](https://github.com/jan-molak/serenity-js/issues/168) [#220](https://github.com/jan-molak/serenity-js/issues/220)
* **cucumber:** [@serenity-js](https://github.com/serenity-js)/cucumber adapter re-write ([e19c358](https://github.com/jan-molak/serenity-js/commit/e19c358)), closes [#168](https://github.com/jan-molak/serenity-js/issues/168) [#220](https://github.com/jan-molak/serenity-js/issues/220)
* **cucumber:** cucumber adapter reports ambiguous step defs ([cf1ca50](https://github.com/jan-molak/serenity-js/commit/cf1ca50))
* **cucumber:** cucumber adapter reports pending scenarios ([0d4f798](https://github.com/jan-molak/serenity-js/commit/0d4f798))
* **cucumber:** cucumber adapter reports scenario descriptions ([adb3412](https://github.com/jan-molak/serenity-js/commit/adb3412))
* **cucumber:** cucumber adapter reports scenario descriptions ([98ffa62](https://github.com/jan-molak/serenity-js/commit/98ffa62))
* **cucumber:** gherkin file is only parsed once and then cached ([9542f38](https://github.com/jan-molak/serenity-js/commit/9542f38))
* **cucumber:** scenarios are tagged with Feature, Capability and Theme tags ([a1fef6c](https://github.com/jan-molak/serenity-js/commit/a1fef6c))
* **cucumber:** stand-alone, Protractor-free integration with Cucumber.js ([3db3c3b](https://github.com/jan-molak/serenity-js/commit/3db3c3b)), closes [#90](https://github.com/jan-molak/serenity-js/issues/90)
* **cucumber:** support for Cucumber 2.x ([d8b8ff4](https://github.com/jan-molak/serenity-js/commit/d8b8ff4)), closes [#28](https://github.com/jan-molak/serenity-js/issues/28)
* **cucumber:** support for Cucumber 5.x ([c3bd443](https://github.com/jan-molak/serenity-js/commit/c3bd443)), closes [#28](https://github.com/jan-molak/serenity-js/issues/28)
* **cucumber:** support for Cucumber.js 3.x ([ecfe34f](https://github.com/jan-molak/serenity-js/commit/ecfe34f)), closes [#28](https://github.com/jan-molak/serenity-js/issues/28)
* **cucumber:** support for Cucumber.js 4.x ([330d731](https://github.com/jan-molak/serenity-js/commit/330d731)), closes [#28](https://github.com/jan-molak/serenity-js/issues/28)
* **cucumber:** support for Data Tables ([32c6d08](https://github.com/jan-molak/serenity-js/commit/32c6d08))
* **cucumber:** support for reporting DocStrings ([a0d43ad](https://github.com/jan-molak/serenity-js/commit/a0d43ad))
* **cucumber:** support for Scenario Outlines ([616640d](https://github.com/jan-molak/serenity-js/commit/616640d)), closes [#168](https://github.com/jan-molak/serenity-js/issues/168) [#220](https://github.com/jan-molak/serenity-js/issues/220) [#162](https://github.com/jan-molak/serenity-js/issues/162)
* **cucumber:** timed out steps and scenarios are correctly reported ([4f5ad46](https://github.com/jan-molak/serenity-js/commit/4f5ad46))
* **cucumber-2:** cucumber-2 module no longer depends on protractor. ([799bde6](https://github.com/jan-molak/serenity-js/commit/799bde6))
* **cucumber-2:** cucumber-2 module will be released as [@serenity-js](https://github.com/serenity-js)/cucumber-2 ([b5db674](https://github.com/jan-molak/serenity-js/commit/b5db674))
* **cucumber-2:** test release of the cucumber-2 module ([10ee900](https://github.com/jan-molak/serenity-js/commit/10ee900))
* **interactions:** new "Patch" interaction plus the CallAnApi ability returns axios responses so th ([747580b](https://github.com/jan-molak/serenity-js/commit/747580b))
* **interactions:** useAngular.disableSynchronisation() and UseAngular.enableSynchronisation() inter ([3b1a3b5](https://github.com/jan-molak/serenity-js/commit/3b1a3b5))
* **local-server:** the new local-server module ([29b2527](https://github.com/jan-molak/serenity-js/commit/29b2527))
* **protractor:** 'serenity-js/protractor' gives easy access to 'serenity-js/lib/screenplay-protractor' ([029e5f4](https://github.com/jan-molak/serenity-js/commit/029e5f4))
* **protractor:** \`Scroll.to(target)\` moves the browser view port to a specific target. ([48239b3](https://github.com/jan-molak/serenity-js/commit/48239b3))
* **protractor:** JetBrains tools should be able to report scenario duration ([3afb8fc](https://github.com/jan-molak/serenity-js/commit/3afb8fc))
* **protractor:** support for multi-capability tests ([bdeb5fb](https://github.com/jan-molak/serenity-js/commit/bdeb5fb)), closes [#61](https://github.com/jan-molak/serenity-js/issues/61)
* **protractor:** switch task lets you switch between popup windows ([fdedf8a](https://github.com/jan-molak/serenity-js/commit/fdedf8a))
* **rest:** [@serenity-js](https://github.com/serenity-js)/rest 2.0 ([ad0a677](https://github.com/jan-molak/serenity-js/commit/ad0a677))
* **screenplay:** compact Question.where(...) and Interaction.where(...) should save some precious k ([2b1e3f8](https://github.com/jan-molak/serenity-js/commit/2b1e3f8))
* **screenplay:** screenplay classes to enable integration with REST-based HTTP APIs ([368c1a2](https://github.com/jan-molak/serenity-js/commit/368c1a2)), closes [#134](https://github.com/jan-molak/serenity-js/issues/134) [#40](https://github.com/jan-molak/serenity-js/issues/40)
* **serenity-cucumber-2:** first draft of the Cucumber 2 adapter ([7adc566](https://github.com/jan-molak/serenity-js/commit/7adc566)), closes [#28](https://github.com/jan-molak/serenity-js/issues/28)
