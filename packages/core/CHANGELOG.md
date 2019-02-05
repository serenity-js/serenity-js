# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1-alpha.9](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.8...v2.0.1-alpha.9) (2019-02-05)


### Bug Fixes

* **core:** Path works on both Windows and *nix systems ([5ebb30b](https://github.com/jan-molak/serenity-js/commit/5ebb30b)), closes [#142](https://github.com/jan-molak/serenity-js/issues/142)





## [2.0.1-alpha.8](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.7...v2.0.1-alpha.8) (2019-02-04)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.7](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.6...v2.0.1-alpha.7) (2019-02-03)


### Features

* **protractor:** Screenplay-style expectations for Protractor ([5a86862](https://github.com/jan-molak/serenity-js/commit/5a86862))





## [2.0.1-alpha.6](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.5...v2.0.1-alpha.6) (2019-02-02)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.5](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.4...v2.0.1-alpha.5) (2019-02-02)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.4](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.3...v2.0.1-alpha.4) (2019-02-01)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.3](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.2...v2.0.1-alpha.3) (2019-01-31)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.2](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.1...v2.0.1-alpha.2) (2019-01-31)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.1](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.0...v2.0.1-alpha.1) (2019-01-31)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.0](https://github.com/jan-molak/serenity-js/compare/v1.2.1...v2.0.1-alpha.0) (2019-01-31)


### Bug Fixes

* **core:** \`reportData\` is displayed in a correct context in the Serenity BDD report ([9d480ee](https://github.com/jan-molak/serenity-js/commit/9d480ee))
* **core:** check if stack trace is available before reading it ([0c87143](https://github.com/jan-molak/serenity-js/commit/0c87143)), closes [#84](https://github.com/jan-molak/serenity-js/issues/84)
* **core:** shorthand \`Question.where\` replaced by \`Question.about\` as \`where\` was both incorrect and ([46abbd3](https://github.com/jan-molak/serenity-js/commit/46abbd3))
* **core:** step annotation calls the method referenced in the template in a correct context ([d5f76fd](https://github.com/jan-molak/serenity-js/commit/d5f76fd))
* **cucumber:** a sequence of activities is correctly reported ([b66b266](https://github.com/jan-molak/serenity-js/commit/b66b266))
* **npm:** corrected the npm publish configuration ([fc7099d](https://github.com/jan-molak/serenity-js/commit/fc7099d))
* **reporting:** [@manual](https://github.com/manual) tags are correctly represented in the report ([babc587](https://github.com/jan-molak/serenity-js/commit/babc587)), closes [#67](https://github.com/jan-molak/serenity-js/issues/67)
* **reporting:** corrected promise and fs handling in SerenityBDDReporter/FileSystem ([6a36d94](https://github.com/jan-molak/serenity-js/commit/6a36d94))
* **reporting:** do not include the tags in the name of the json report if the scenario doesn't have ([1b0371e](https://github.com/jan-molak/serenity-js/commit/1b0371e))
* **reporting:** execution context of a scenario is considered when generating the scenario ID and na ([cd71d71](https://github.com/jan-molak/serenity-js/commit/cd71d71)), closes [#75](https://github.com/jan-molak/serenity-js/issues/75)
* **reporting:** stacktrace-js seems to not recognise the origin of the stack frame under some condit ([4827c9b](https://github.com/jan-molak/serenity-js/commit/4827c9b)), closes [#64](https://github.com/jan-molak/serenity-js/issues/64)
* **reporting:** support for Node 8.x ([eb9c458](https://github.com/jan-molak/serenity-js/commit/eb9c458)), closes [#122](https://github.com/jan-molak/serenity-js/issues/122)
* **reporting:** themes, Capabilities and Features are correctly tagged and appear in the report. ([9bbcf81](https://github.com/jan-molak/serenity-js/commit/9bbcf81)), closes [#75](https://github.com/jan-molak/serenity-js/issues/75) [#81](https://github.com/jan-molak/serenity-js/issues/81)
* **screenplay:** corrected the Actor class so that it compiles using the new TypeScript compiler ([a212ccb](https://github.com/jan-molak/serenity-js/commit/a212ccb)), closes [#105](https://github.com/jan-molak/serenity-js/issues/105)
* **screenplay:** corrected the return type expected by the Question interface ([58ed941](https://github.com/jan-molak/serenity-js/commit/58ed941)), closes [#57](https://github.com/jan-molak/serenity-js/issues/57)


### Features

* **assertions:** first draft of the [@serenity-js](https://github.com/serenity-js)/assertions module ([d1326b9](https://github.com/jan-molak/serenity-js/commit/d1326b9))
* **assertions:** new assertions library ([71b16ea](https://github.com/jan-molak/serenity-js/commit/71b16ea))
* **config:** output directory is configurable ([03b2842](https://github.com/jan-molak/serenity-js/commit/03b2842)), closes [#45](https://github.com/jan-molak/serenity-js/issues/45)
* **core:** [@serenity-js](https://github.com/serenity-js)/core is independent of Protractor ([5dc4dd1](https://github.com/jan-molak/serenity-js/commit/5dc4dd1)), closes [#6](https://github.com/jan-molak/serenity-js/issues/6)
* **core:** [@serenity-js](https://github.com/serenity-js)/core published to npm ([3630da6](https://github.com/jan-molak/serenity-js/commit/3630da6))
* **core:** [@serenity](https://github.com/serenity)/core is no longer dependent on Protractor ([a935948](https://github.com/jan-molak/serenity-js/commit/a935948)), closes [#40](https://github.com/jan-molak/serenity-js/issues/40) [#6](https://github.com/jan-molak/serenity-js/issues/6)
* **core:** arbitrary data can be attached to interactions reported in the test reports ([cd67a74](https://github.com/jan-molak/serenity-js/commit/cd67a74))
* **core:** conditional activities ([3883ece](https://github.com/jan-molak/serenity-js/commit/3883ece)), closes [#159](https://github.com/jan-molak/serenity-js/issues/159)
* **core:** consoleReporter prints to stdout and stderr by default ([0ea8f1e](https://github.com/jan-molak/serenity-js/commit/0ea8f1e))
* **core:** implemented the Stage ([ec5aa5d](https://github.com/jan-molak/serenity-js/commit/ec5aa5d))
* **core:** knownUnkowns - an Actor answers Questions and more! ([892ba7a](https://github.com/jan-molak/serenity-js/commit/892ba7a))
* **core:** re-write of [@serenity-js](https://github.com/serenity-js)/core ([d83554a](https://github.com/jan-molak/serenity-js/commit/d83554a)), closes [#156](https://github.com/jan-molak/serenity-js/issues/156) [#105](https://github.com/jan-molak/serenity-js/issues/105) [#162](https://github.com/jan-molak/serenity-js/issues/162)
* **core:** sceneTagged event allows for the scene to be tagged with an arbitrary tag ([75208e1](https://github.com/jan-molak/serenity-js/commit/75208e1)), closes [#61](https://github.com/jan-molak/serenity-js/issues/61)
* **core:** support for Capability and Theme scenario tags ([76c165a](https://github.com/jan-molak/serenity-js/commit/76c165a))
* **cucumber:** [@serenity-js](https://github.com/serenity-js)/cucumber adapter re-write ([e19c358](https://github.com/jan-molak/serenity-js/commit/e19c358)), closes [#168](https://github.com/jan-molak/serenity-js/issues/168) [#220](https://github.com/jan-molak/serenity-js/issues/220)
* **cucumber:** cucumber adapter reports scenario descriptions ([adb3412](https://github.com/jan-molak/serenity-js/commit/adb3412))
* **cucumber:** gherkin file is only parsed once and then cached ([9542f38](https://github.com/jan-molak/serenity-js/commit/9542f38))
* **cucumber:** support for Cucumber 2.x ([d8b8ff4](https://github.com/jan-molak/serenity-js/commit/d8b8ff4)), closes [#28](https://github.com/jan-molak/serenity-js/issues/28)
* **cucumber:** support for Cucumber.js 3.x ([ecfe34f](https://github.com/jan-molak/serenity-js/commit/ecfe34f)), closes [#28](https://github.com/jan-molak/serenity-js/issues/28)
* **cucumber:** support for Scenario Outlines ([616640d](https://github.com/jan-molak/serenity-js/commit/616640d)), closes [#168](https://github.com/jan-molak/serenity-js/issues/168) [#220](https://github.com/jan-molak/serenity-js/issues/220) [#162](https://github.com/jan-molak/serenity-js/issues/162)
* **cucumber:** timed out steps and scenarios are correctly reported ([4f5ad46](https://github.com/jan-molak/serenity-js/commit/4f5ad46))
* **cucumber-2:** cucumber-2 module no longer depends on protractor. ([799bde6](https://github.com/jan-molak/serenity-js/commit/799bde6))
* **local-server:** the new local-server module ([29b2527](https://github.com/jan-molak/serenity-js/commit/29b2527))
* **rest:** [@serenity-js](https://github.com/serenity-js)/rest 2.0 ([ad0a677](https://github.com/jan-molak/serenity-js/commit/ad0a677))
* **screenplay:** compact Question.where(...) and Interaction.where(...) should save some precious k ([2b1e3f8](https://github.com/jan-molak/serenity-js/commit/2b1e3f8))
