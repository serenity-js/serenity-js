# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.com/serenity-js/serenity-js/compare/v3.0.0...v3.0.1) (2023-03-25)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.45...v3.0.0) (2023-03-23)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.45](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.44...v3.0.0-rc.45) (2023-03-22)


### Bug Fixes

* **core:** removed deprecated ContextTag ([d09a688](https://github.com/serenity-js/serenity-js/commit/d09a6888020f2a7f76c0830b6d2939205cf0b3aa)), closes [#1403](https://github.com/serenity-js/serenity-js/issues/1403)





# [3.0.0-rc.44](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.43...v3.0.0-rc.44) (2023-03-19)


### Bug Fixes

* **core:** moved time-related code to a common package ([f29fedc](https://github.com/serenity-js/serenity-js/commit/f29fedc0e67d0db942b247aed53a243868a5f6dd)), closes [#1522](https://github.com/serenity-js/serenity-js/issues/1522)
* **core:** support for NPM 9 ([0493474](https://github.com/serenity-js/serenity-js/commit/0493474a1e28b86b1b60f69ec0d591c1a3265425))
* **deps:** update dependency tiny-types to ^1.19.1 ([ce335eb](https://github.com/serenity-js/serenity-js/commit/ce335ebca434d1fd0e6e809a65a0882fd10a311a))
* **rest:** support for Axios 1.3.4 ([e926bbd](https://github.com/serenity-js/serenity-js/commit/e926bbde5232150f35e137601e321175d21d52d2))


### Features

* **core:** introduced a new ability ScheduleWork to enable [#1083](https://github.com/serenity-js/serenity-js/issues/1083) and [#1522](https://github.com/serenity-js/serenity-js/issues/1522) ([b275d18](https://github.com/serenity-js/serenity-js/commit/b275d18434cdedf069c5f1da3b9b359fc7da60fe))





# [3.0.0-rc.43](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.42...v3.0.0-rc.43) (2023-03-10)


### Bug Fixes

* **deps:** update dependency yargs to ^17.7.1 ([1e7a52b](https://github.com/serenity-js/serenity-js/commit/1e7a52b21a778ebc47b6279786391d96e482b57a))





# [3.0.0-rc.42](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.41...v3.0.0-rc.42) (2023-02-12)


### Bug Fixes

* **core:** event TestRunFinished now incidates the Outcome of the test suite ([a941056](https://github.com/serenity-js/serenity-js/commit/a9410566891e543101b935a80db9c7daea0c9944)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)
* **playwright-test:** default to using file name as feature name when describe blocks are absent ([1295b04](https://github.com/serenity-js/serenity-js/commit/1295b04adcd12a9d7eaef795e1080bb1c5a9056d)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)
* **serenity-bdd:** prevent invalid Serenity BDD JSON reports from being sent to processing ([e59d4da](https://github.com/serenity-js/serenity-js/commit/e59d4da0646c103db37631ecc33ecd66ae18d05e)), closes [#1495](https://github.com/serenity-js/serenity-js/issues/1495)





# [3.0.0-rc.41](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.40...v3.0.0-rc.41) (2023-02-07)


### Bug Fixes

* **core:** removed AssertionReport and AssertionReportDiffer as they're no longer needed ([a968ac5](https://github.com/serenity-js/serenity-js/commit/a968ac57365e10b503e74db4319eb96b3430ffb0)), closes [#1480](https://github.com/serenity-js/serenity-js/issues/1480)


### Features

* **assertions:** diffs included in RuntimeErrors are now colour-coded ([f88efb4](https://github.com/serenity-js/serenity-js/commit/f88efb48180924351e8f7b25c44f3560b0e01b0d)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **core:** better assertion errors reporting in Visual Studio Code ([3b94b7d](https://github.com/serenity-js/serenity-js/commit/3b94b7d606fae49e7ca77c2fbe09d07eeb042ea9)), closes [#1486](https://github.com/serenity-js/serenity-js/issues/1486)
* **core:** overridable abilities ([03966cc](https://github.com/serenity-js/serenity-js/commit/03966ccae40d102b7dbca1125beb90ceda8fbc50))





# [3.0.0-rc.40](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.39...v3.0.0-rc.40) (2023-01-06)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.39](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.38...v3.0.0-rc.39) (2023-01-05)


### Bug Fixes

* **core:** simplified internal AsyncOperation events to separate service name from task description ([0162d28](https://github.com/serenity-js/serenity-js/commit/0162d287c84a4ab716e5e655cfc2b816ba89f394))
* **rest:** support for Axios 1.2.2 ([b6fa54b](https://github.com/serenity-js/serenity-js/commit/b6fa54b0d372bcf846d12bb60c91ac637015d1c6))





# [3.0.0-rc.38](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.37...v3.0.0-rc.38) (2022-12-28)


### Bug Fixes

* **serenity-bdd:** better error message when Java Runtime Environment is not detected ([47c00c3](https://github.com/serenity-js/serenity-js/commit/47c00c342c4d63034a433b96c91eba2ed1305544)), closes [#1455](https://github.com/serenity-js/serenity-js/issues/1455)





# [3.0.0-rc.37](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.36...v3.0.0-rc.37) (2022-12-18)


### Bug Fixes

* **deps:** update serenity bdd dependencies ([51af1fc](https://github.com/serenity-js/serenity-js/commit/51af1fc1b104cd3821e2e807b1cf8c90fdb3b418))


### Features

* **rest:** support for Axios 1.2.1 ([b1ab268](https://github.com/serenity-js/serenity-js/commit/b1ab268319b6e165f051be8382cb5945ca6d1944))





# [3.0.0-rc.36](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.35...v3.0.0-rc.36) (2022-11-28)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.35](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.34...v3.0.0-rc.35) (2022-11-25)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.34](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.33...v3.0.0-rc.34) (2022-11-21)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.33](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.32...v3.0.0-rc.33) (2022-11-07)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.32](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.31...v3.0.0-rc.32) (2022-10-12)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.31](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.30...v3.0.0-rc.31) (2022-10-07)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.30](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.29...v3.0.0-rc.30) (2022-10-05)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.29](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.28...v3.0.0-rc.29) (2022-10-01)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.28](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.27...v3.0.0-rc.28) (2022-09-30)


### Bug Fixes

* **core:** activity is now able to detect invocation location on Node 14 ([41f4776](https://github.com/serenity-js/serenity-js/commit/41f4776736620bc32d474d9b66f69c742f8eca96)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** enabled support for synthetic default imports and ES module interop ([3e63d07](https://github.com/serenity-js/serenity-js/commit/3e63d07d793cea169ebc4234ab096593f5aa9d97)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** improved implementation of EventQueue to better support parallel scenarios ([025e4fd](https://github.com/serenity-js/serenity-js/commit/025e4fdf962d6a7e31dde428a39a352983b1f2ab)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)


### Features

* **console-reporter:** improved support for tests executed in parallel ([01264ce](https://github.com/serenity-js/serenity-js/commit/01264ce6110a3199265468f633eee5623fabe008)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** improved Playwright Test reports ([6c6b537](https://github.com/serenity-js/serenity-js/commit/6c6b5379dfc324a4fb75d758daa7782109f1c5ab)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **serenity-bdd:** support for configuring SerenityBDDReporter using a ClassDescription string ([968e349](https://github.com/serenity-js/serenity-js/commit/968e349940d3ebe6d72dc94ca4db4b7e3a529b93)), closes [#594](https://github.com/serenity-js/serenity-js/issues/594)





# [3.0.0-rc.27](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.26...v3.0.0-rc.27) (2022-08-26)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.26](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.25...v3.0.0-rc.26) (2022-08-15)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.25](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.24...v3.0.0-rc.25) (2022-08-15)


### Bug Fixes

* **core:** extracted common TypeScript configuration ([0108370](https://github.com/serenity-js/serenity-js/commit/0108370a6a7ebb4bcd71773482801d29f5660268))
* **deps:** updated TinyTypes to 1.19.0 ([f6d53e4](https://github.com/serenity-js/serenity-js/commit/f6d53e4dbbfcb81139bd888ac11441b6344e47f5))





# [3.0.0-rc.24](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.23...v3.0.0-rc.24) (2022-07-23)

**Note:** Version bump only for package @serenity-js/serenity-bdd





# [3.0.0-rc.23](https://github.com/serenity-js/serenity-js/compare/v2.33.10...v3.0.0-rc.23) (2022-07-19)


### Bug Fixes

* **node:** support for Node 18 ([73212bc](https://github.com/serenity-js/serenity-js/commit/73212bc9deb1998d871b0720a6b437687b3ceddc)), closes [#1243](https://github.com/serenity-js/serenity-js/issues/1243)



# [3.0.0-rc.22](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.21...v3.0.0-rc.22) (2022-07-15)



# [3.0.0-rc.21](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.20...v3.0.0-rc.21) (2022-07-11)



# [3.0.0-rc.20](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.19...v3.0.0-rc.20) (2022-07-11)



# [3.0.0-rc.19](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.18...v3.0.0-rc.19) (2022-06-11)


### Bug Fixes

* **rest:** updated Axios to 0.27.2 ([b54694b](https://github.com/serenity-js/serenity-js/commit/b54694ba3dd2b8e0316d94c44381f51b1ab79ad0)), closes [axios/axios#4124](https://github.com/axios/axios/issues/4124) [#1223](https://github.com/serenity-js/serenity-js/issues/1223)



# [3.0.0-rc.18](https://github.com/serenity-js/serenity-js/compare/v2.33.9...v3.0.0-rc.18) (2022-06-06)


### Bug Fixes

* **deps:** updated tiny-types ([f1951cf](https://github.com/serenity-js/serenity-js/commit/f1951cf753df3807b5778d116f8e8bc3f24830a7))
* **deps:** updated tiny-types to 1.18.2 ([83a651c](https://github.com/serenity-js/serenity-js/commit/83a651c4c2f3f8dbaabcdacba94c720efdff45dd))



# [3.0.0-rc.17](https://github.com/serenity-js/serenity-js/compare/v2.33.8...v3.0.0-rc.17) (2022-06-02)



# [3.0.0-rc.16](https://github.com/serenity-js/serenity-js/compare/v2.33.6...v3.0.0-rc.16) (2022-04-15)



# [3.0.0-rc.15](https://github.com/serenity-js/serenity-js/compare/v2.33.5...v3.0.0-rc.15) (2022-04-10)


### Bug Fixes

* **web:** replaced legacy PromiseLike return types with native Promise types ([436b3cb](https://github.com/serenity-js/serenity-js/commit/436b3cba1793f63008a56633cc93669736155ce6))



# [3.0.0-rc.14](https://github.com/serenity-js/serenity-js/compare/v2.33.3...v3.0.0-rc.14) (2022-03-28)



# [3.0.0-rc.13](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.12...v3.0.0-rc.13) (2022-03-02)



# [3.0.0-rc.12](https://github.com/serenity-js/serenity-js/compare/v2.33.2...v3.0.0-rc.12) (2022-02-23)


### Bug Fixes

* **serenity-bdd:** downgraded to Serenity BDD CLI 3.1.0 ([773786a](https://github.com/serenity-js/serenity-js/commit/773786af91f0aaab5a6deeba8b327fda0f5cfb9f)), closes [#1133](https://github.com/serenity-js/serenity-js/issues/1133)



# [3.0.0-rc.11](https://github.com/serenity-js/serenity-js/compare/v2.33.1...v3.0.0-rc.11) (2022-02-13)


### Features

* **serenity-bdd:** updated Serenity BDD CLI to 3.2.0, which introduces new HTML reports ([9abdbd6](https://github.com/serenity-js/serenity-js/commit/9abdbd66721585af3f16d5def78e0484b9a08a92))



# [3.0.0-rc.10](https://github.com/serenity-js/serenity-js/compare/v2.33.0...v3.0.0-rc.10) (2022-02-03)



# [3.0.0-rc.9](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.8...v3.0.0-rc.9) (2022-02-01)



# [3.0.0-rc.8](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.7...v3.0.0-rc.8) (2022-01-28)



# [3.0.0-rc.7](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.6...v3.0.0-rc.7) (2022-01-28)


### Features

* **core:** replaced `Adapter` with `QuestionAdapter` and introduced `Optional` ([8d84ad3](https://github.com/serenity-js/serenity-js/commit/8d84ad3863e3c726533d0f21934fb1e2fa8b3022)), closes [#1103](https://github.com/serenity-js/serenity-js/issues/1103)



# [3.0.0-rc.6](https://github.com/serenity-js/serenity-js/compare/v2.32.7...v3.0.0-rc.6) (2022-01-10)



# [3.0.0-rc.5](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.4...v3.0.0-rc.5) (2022-01-07)



# [3.0.0-rc.4](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.3...v3.0.0-rc.4) (2021-12-30)



# [3.0.0-rc.3](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.2...v3.0.0-rc.3) (2021-12-29)


### Bug Fixes

* **deps:** updated tiny-types to 1.17.0 ([3187051](https://github.com/serenity-js/serenity-js/commit/3187051594158b4b450c82e851e417fd2ed21652))



# [3.0.0-rc.2](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.1...v3.0.0-rc.2) (2021-12-09)



# [3.0.0-rc.1](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.0...v3.0.0-rc.1) (2021-12-09)


### Bug Fixes

* **serenity-bdd:** upgraded Serenity BDD CLI to 2.6.0 ([93c32f2](https://github.com/serenity-js/serenity-js/commit/93c32f267709e20f5a27a4eed712a233711c8d31))



# [3.0.0-rc.0](https://github.com/serenity-js/serenity-js/compare/v2.32.5...v3.0.0-rc.0) (2021-12-08)


### Bug Fixes

* **core:** 3.0 RC ([469d54e](https://github.com/serenity-js/serenity-js/commit/469d54e4f81ef430566b93852e3174826f8ef672)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)


### Features

* **core:** question.about produces "props" that proxy the methods of the underlying model ([f771872](https://github.com/serenity-js/serenity-js/commit/f771872c56b487e404002c3800fc8f3baaed804f))
* **web:** support for working with cookies ([39cde6d](https://github.com/serenity-js/serenity-js/commit/39cde6de7a36d27a8b1c596493efbec94900af6b)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)


### BREAKING CHANGES

* **core:** Introduced @serenity-js/web - a shared library for Serenity/JS Web integration
modules such as @serenity-js/protractor and @serenity-js/webdriverio. Dropped support for Node 12.
