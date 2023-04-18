# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
