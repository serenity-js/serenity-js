# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
