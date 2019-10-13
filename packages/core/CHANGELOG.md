# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1-alpha.85](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.84...v2.0.1-alpha.85) (2019-10-13)


### Bug Fixes

* **core:** Dropped support for node 6 ([74d1ece](https://github.com/jan-molak/serenity-js/commit/74d1ece))





## [2.0.1-alpha.84](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.83...v2.0.1-alpha.84) (2019-09-24)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.83](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.82...v2.0.1-alpha.83) (2019-09-23)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.82](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.81...v2.0.1-alpha.82) (2019-09-22)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.81](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.80...v2.0.1-alpha.81) (2019-09-16)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.80](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.79...v2.0.1-alpha.80) (2019-09-05)


### Bug Fixes

* **core:** Handle Windows EACCES errors correctly ([491499e](https://github.com/jan-molak/serenity-js/commit/491499e))





## [2.0.1-alpha.77](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.76...v2.0.1-alpha.77) (2019-09-01)


### Features

* **serenity-bdd:** Extracted the SerenityBDDReporter into a separate module ([fe7cfca](https://github.com/jan-molak/serenity-js/commit/fe7cfca))





## [2.0.1-alpha.76](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.75...v2.0.1-alpha.76) (2019-08-05)


### Bug Fixes

* **core:** Renamed Log.info(answerable) to Log.the(answerable), since it's all getting logged to std out anyway. ([8705efd](https://github.com/jan-molak/serenity-js/commit/8705efd))
* **core:** Renamed Log.info(answerable) to Log.the(answerable), since it's all getting logged to std out anyway. ([5290c8b](https://github.com/jan-molak/serenity-js/commit/5290c8b))


### Features

* **core:** The ability to TakeNotes and the associated TakeNote.of(question), which makes the Actor remember the answer to a question and Note.of(question), which makes the Actor retrieve the remembered value. ([a0e7f99](https://github.com/jan-molak/serenity-js/commit/a0e7f99)), closes [#318](https://github.com/jan-molak/serenity-js/issues/318)





## [2.0.1-alpha.75](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.74...v2.0.1-alpha.75) (2019-07-16)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.74](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.73...v2.0.1-alpha.74) (2019-07-07)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.73](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.72...v2.0.1-alpha.73) (2019-06-24)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.72](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.71...v2.0.1-alpha.72) (2019-06-23)


### Bug Fixes

* **core:** Fixed serialisation logic of ArtifactArchived and ActivityRelatedArtifactArchived ([58d4536](https://github.com/jan-molak/serenity-js/commit/58d4536))





## [2.0.1-alpha.71](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.70...v2.0.1-alpha.71) (2019-06-23)


### Features

* **core:** The new StreamReporter helps to analyse issues that have occurred at runtime ([f96f9f8](https://github.com/jan-molak/serenity-js/commit/f96f9f8))





## [2.0.1-alpha.70](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.69...v2.0.1-alpha.70) (2019-06-22)


### Bug Fixes

* **core:** DebugReporter prints domain events serialised as ndjson ([076587e](https://github.com/jan-molak/serenity-js/commit/076587e))





## [2.0.1-alpha.69](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.68...v2.0.1-alpha.69) (2019-06-20)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.68](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.67...v2.0.1-alpha.68) (2019-05-28)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.67](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.66...v2.0.1-alpha.67) (2019-05-27)


### Features

* **protractor:** Jasmine adapter for Protractor ([97bf841](https://github.com/jan-molak/serenity-js/commit/97bf841))





## [2.0.1-alpha.66](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.65...v2.0.1-alpha.66) (2019-05-23)


### Bug Fixes

* **core:** WithStage moved to @serenity-js/core ([30184f8](https://github.com/jan-molak/serenity-js/commit/30184f8))





## [2.0.1-alpha.65](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.64...v2.0.1-alpha.65) (2019-05-14)


### Features

* **jasmine:** Serenity reporter for Jasmine ([afff01a](https://github.com/jan-molak/serenity-js/commit/afff01a))





## [2.0.1-alpha.64](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.63...v2.0.1-alpha.64) (2019-05-02)


### Bug Fixes

* **core:** StageCrewMembers are now exported directly from @serenity-js/core ([e476d53](https://github.com/jan-molak/serenity-js/commit/e476d53))





## [2.0.1-alpha.63](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.62...v2.0.1-alpha.63) (2019-05-01)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.62](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.61...v2.0.1-alpha.62) (2019-05-01)


### Features

* **core:** ArtifactArchiver can be instantiated using a convenient factory method ([6716f5f](https://github.com/jan-molak/serenity-js/commit/6716f5f))





## [2.0.1-alpha.61](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.60...v2.0.1-alpha.61) (2019-04-29)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.60](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.59...v2.0.1-alpha.60) (2019-04-29)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.59](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.58...v2.0.1-alpha.59) (2019-04-29)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.58](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.57...v2.0.1-alpha.58) (2019-04-26)


### Features

* **assertions:** Ensure reports the actual value if the expectation is not met ([4d00be3](https://github.com/jan-molak/serenity-js/commit/4d00be3))





## [2.0.1-alpha.57](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.56...v2.0.1-alpha.57) (2019-04-25)


### Bug Fixes

* **ci:** Corrected the version numbers ([5e97d35](https://github.com/jan-molak/serenity-js/commit/5e97d35))





## [2.0.1-alpha.54](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.53...v2.0.1-alpha.54) (2019-04-24)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.53](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.52...v2.0.1-alpha.53) (2019-04-24)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.52](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.51...v2.0.1-alpha.52) (2019-04-24)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.51](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.50...v2.0.1-alpha.51) (2019-04-23)


### Bug Fixes

* **cucumber:** Corrected how steps are reported for scenarios that use before/after hooks ([6563309](https://github.com/jan-molak/serenity-js/commit/6563309)), closes [cucumber/cucumber-js#1195](https://github.com/cucumber/cucumber-js/issues/1195)





## [2.0.1-alpha.50](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.49...v2.0.1-alpha.50) (2019-04-18)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.49](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.48...v2.0.1-alpha.49) (2019-04-17)


### Features

* **protractor:** ProtractorFrameworkAdapter for Cucumber ([7474dbb](https://github.com/jan-molak/serenity-js/commit/7474dbb))





## [2.0.1-alpha.48](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.47...v2.0.1-alpha.48) (2019-04-11)


### Bug Fixes

* **core:** Corrected the RuntimeError class so that the name of the constructor is present in the st ([0d2164d](https://github.com/jan-molak/serenity-js/commit/0d2164d))


### Features

* **core:** Transform allows for transforming an answer to a question ([082adeb](https://github.com/jan-molak/serenity-js/commit/082adeb))





## [2.0.1-alpha.47](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.46...v2.0.1-alpha.47) (2019-04-07)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.45](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.44...v2.0.1-alpha.45) (2019-04-05)

**Note:** Version bump only for package @serenity-js/core





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

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.33](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.32...v2.0.1-alpha.33) (2019-03-14)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.32](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.31...v2.0.1-alpha.32) (2019-03-13)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.31](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.30...v2.0.1-alpha.31) (2019-03-07)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.30](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.29...v2.0.1-alpha.30) (2019-03-07)


### Features

* **assertions:** containAtLeastOneThat(expectation) ([dec5618](https://github.com/jan-molak/serenity-js/commit/dec5618))





## [2.0.1-alpha.29](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.28...v2.0.1-alpha.29) (2019-03-06)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.28](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.27...v2.0.1-alpha.28) (2019-03-06)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.27](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.26...v2.0.1-alpha.27) (2019-03-05)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.26](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.25...v2.0.1-alpha.26) (2019-03-05)


### Bug Fixes

* **core:** Ensure the `reportData` entries in the report are compatible with Serenity BDD CLI ([95afc5a](https://github.com/jan-molak/serenity-js/commit/95afc5a))





## [2.0.1-alpha.25](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.24...v2.0.1-alpha.25) (2019-03-04)


### Features

* **protractor:** LastScriptExecution.result() gives access to the value returned by the script pass ([75acc79](https://github.com/jan-molak/serenity-js/commit/75acc79))





## [2.0.1-alpha.24](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.23...v2.0.1-alpha.24) (2019-03-02)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.23](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.22...v2.0.1-alpha.23) (2019-03-02)


### Bug Fixes

* **core:** Test reports no longer contain a duplicate entry for with the contents of the report ([2c36962](https://github.com/jan-molak/serenity-js/commit/2c36962))


### Features

* **protractor:** ExecuteScript interactions and cleanup of the package structure ([753d511](https://github.com/jan-molak/serenity-js/commit/753d511))





## [2.0.1-alpha.22](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.21...v2.0.1-alpha.22) (2019-02-27)


### Features

* **core:** toString method of Screenplay classes prints the name of the function ([f3d738e](https://github.com/jan-molak/serenity-js/commit/f3d738e))
* **protractor:** Nestable Targets, relative Questions and improvements to Pick ([56ea633](https://github.com/jan-molak/serenity-js/commit/56ea633))





## [2.0.1-alpha.21](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.20...v2.0.1-alpha.21) (2019-02-21)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.20](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.19...v2.0.1-alpha.20) (2019-02-19)

**Note:** Version bump only for package @serenity-js/core





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

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.16](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.15...v2.0.1-alpha.16) (2019-02-13)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.15](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.14...v2.0.1-alpha.15) (2019-02-13)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.14](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.13...v2.0.1-alpha.14) (2019-02-06)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.13](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.12...v2.0.1-alpha.13) (2019-02-06)

**Note:** Version bump only for package @serenity-js/core





## [2.0.1-alpha.12](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.11...v2.0.1-alpha.12) (2019-02-05)


### Bug Fixes

* **core:** AssertionErrors are correctly reported ([fc2a881](https://github.com/jan-molak/serenity-js/commit/fc2a881))





## [2.0.1-alpha.11](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.10...v2.0.1-alpha.11) (2019-02-05)


### Bug Fixes

* **cucumber:** AssertionErrors are reported as such ([7bd837d](https://github.com/jan-molak/serenity-js/commit/7bd837d))





## [2.0.1-alpha.10](https://github.com/jan-molak/serenity-js/compare/v2.0.1-alpha.9...v2.0.1-alpha.10) (2019-02-05)

**Note:** Version bump only for package @serenity-js/core





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
