# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0-rc.40](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.39...v3.0.0-rc.40) (2023-01-06)

**Note:** Version bump only for package @serenity-js/core





# [3.0.0-rc.39](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.38...v3.0.0-rc.39) (2023-01-05)


### Bug Fixes

* **core:** improved Duration to ensure it can't be instantiated with an invalid parameter ([9d89014](https://github.com/serenity-js/serenity-js/commit/9d89014a261659ef07ee05eb9082449019f21e50))
* **core:** improved error message shown when an actor doesn't have a required ability ([753b036](https://github.com/serenity-js/serenity-js/commit/753b0362ffbcc771995f711df89d1d64d4b55d76))
* **core:** simplified AsyncOperation events ([ac1a88f](https://github.com/serenity-js/serenity-js/commit/ac1a88f95560b5f163ac3f2302f4274f4bf99455))
* **core:** simplified internal AsyncOperation events to separate service name from task description ([0162d28](https://github.com/serenity-js/serenity-js/commit/0162d287c84a4ab716e5e655cfc2b816ba89f394))


### Features

* **playwright-test:** custom actors can now be defined in playwright config file ([117da34](https://github.com/serenity-js/serenity-js/commit/117da340c0a9bea214b2a3ea8182d803608697dc))





# [3.0.0-rc.38](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.37...v3.0.0-rc.38) (2022-12-28)


### Bug Fixes

* **assertions:** improved AssertionError messages ([958ab7f](https://github.com/serenity-js/serenity-js/commit/958ab7f79daba8df25dbcff50d6a67b2bef58b29))





# [3.0.0-rc.37](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.36...v3.0.0-rc.37) (2022-12-18)


### Bug Fixes

* **deps:** update core dependencies to v5 ([7c44d5a](https://github.com/serenity-js/serenity-js/commit/7c44d5a6b498c034a5f55a4ae0b787f8ec2b5569))





# [3.0.0-rc.36](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.35...v3.0.0-rc.36) (2022-11-28)


### Bug Fixes

* **core:** reverted the change to List.get and marked method as deprecated, to be removed in 3.0 ([5ac8c69](https://github.com/serenity-js/serenity-js/commit/5ac8c69a5ddb2cbb62a76f5e25cfdeae11135b45)), closes [#1403](https://github.com/serenity-js/serenity-js/issues/1403)





# [3.0.0-rc.35](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.34...v3.0.0-rc.35) (2022-11-25)


### Bug Fixes

* **core:** renamed List.get(index) to List.nth(index) to make the API declarative ([094e21c](https://github.com/serenity-js/serenity-js/commit/094e21ceb08e95ba5c9c5998cb5ecdfb13bdcf1b))


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





# [3.0.0-rc.32](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.31...v3.0.0-rc.32) (2022-10-12)


### Bug Fixes

* **core:** invocation location detection works for built-in interactions ([2ef0688](https://github.com/serenity-js/serenity-js/commit/2ef0688ada99cd372a2b2f9508b5d6b8e18b37f1))





# [3.0.0-rc.31](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.30...v3.0.0-rc.31) (2022-10-07)


### Bug Fixes

* **core:** corrected file system location reporting for built-in Interactions ([ce9acfc](https://github.com/serenity-js/serenity-js/commit/ce9acfc023442230a5060ff823d2198b92f72a30))
* **core:** improved invocation location detection on Windows ([#1332](https://github.com/serenity-js/serenity-js/issues/1332)) ([43dd9b9](https://github.com/serenity-js/serenity-js/commit/43dd9b95803b75cbcfce0eaa91ff272f33f7a60f))





# [3.0.0-rc.30](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.29...v3.0.0-rc.30) (2022-10-05)


### Bug Fixes

* **core:** removed deprecated function `formatted` ([64d7f21](https://github.com/serenity-js/serenity-js/commit/64d7f21a1efc9bb1d13a7c5d086ffcdd208fe5d5)), closes [#1260](https://github.com/serenity-js/serenity-js/issues/1260)





# [3.0.0-rc.29](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.28...v3.0.0-rc.29) (2022-10-01)


### Bug Fixes

* **serenity-bdd:** correct detection of invocation location for internal code ([c76ec76](https://github.com/serenity-js/serenity-js/commit/c76ec764ff7456c5059488a7d12c88990b4e43d8))





# [3.0.0-rc.28](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.27...v3.0.0-rc.28) (2022-09-30)


### Bug Fixes

* **core:** activity is now able to detect invocation location on Node 14 ([41f4776](https://github.com/serenity-js/serenity-js/commit/41f4776736620bc32d474d9b66f69c742f8eca96)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** enabled support for synthetic default imports and ES module interop ([3e63d07](https://github.com/serenity-js/serenity-js/commit/3e63d07d793cea169ebc4234ab096593f5aa9d97)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** improved implementation of EventQueue to better support parallel scenarios ([025e4fd](https://github.com/serenity-js/serenity-js/commit/025e4fdf962d6a7e31dde428a39a352983b1f2ab)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** simplified SceneFinishes event ([9ad947a](https://github.com/serenity-js/serenity-js/commit/9ad947adc49cefd9b64f48b02bc173f073f545c4)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** support for Playwright Test Babel loader ([f9a5412](https://github.com/serenity-js/serenity-js/commit/f9a54127bac921931a8ea115df47b4eb1dc6cc4a)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **playwright-test:** wait for Photographer to finish taking screenshots before dismissing actors ([b0c5adb](https://github.com/serenity-js/serenity-js/commit/b0c5adba83fc92624e91c7385b38f0061cf5a6ed)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)


### Features

* **console-reporter:** improved support for tests executed in parallel ([01264ce](https://github.com/serenity-js/serenity-js/commit/01264ce6110a3199265468f633eee5623fabe008)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **core:** serenity/JS stage crew members can now be configured using `string` ([786cdad](https://github.com/serenity-js/serenity-js/commit/786cdadcda8e031e06b8bee9698a87a7af00d90c)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240) [#594](https://github.com/serenity-js/serenity-js/issues/594)
* **playwright-test:** improved Playwright Test reports ([6c6b537](https://github.com/serenity-js/serenity-js/commit/6c6b5379dfc324a4fb75d758daa7782109f1c5ab)), closes [#1240](https://github.com/serenity-js/serenity-js/issues/1240)
* **serenity-bdd:** support for configuring SerenityBDDReporter using a ClassDescription string ([968e349](https://github.com/serenity-js/serenity-js/commit/968e349940d3ebe6d72dc94ca4db4b7e3a529b93)), closes [#594](https://github.com/serenity-js/serenity-js/issues/594)





# [3.0.0-rc.27](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.26...v3.0.0-rc.27) (2022-08-26)


### Bug Fixes

* **deps:** update dependency diff to ^5.1.0 ([f21af46](https://github.com/serenity-js/serenity-js/commit/f21af465ac79ae8ebb9a6c0b701817027e81512f))
* **deps:** update dependency moment to ^2.29.4 ([7b0fd6e](https://github.com/serenity-js/serenity-js/commit/7b0fd6eeda8bf8c24f61d0d103127740568abc1c))





# [3.0.0-rc.26](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.25...v3.0.0-rc.26) (2022-08-15)

**Note:** Version bump only for package @serenity-js/core





# [3.0.0-rc.25](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.24...v3.0.0-rc.25) (2022-08-15)


### Bug Fixes

* **core:** extracted common TypeScript configuration ([0108370](https://github.com/serenity-js/serenity-js/commit/0108370a6a7ebb4bcd71773482801d29f5660268))
* **core:** refactored the interaction to Wait.until to improve its reliability ([970ea39](https://github.com/serenity-js/serenity-js/commit/970ea396d4b34169480b34258624cd5b886aac37)), closes [#1255](https://github.com/serenity-js/serenity-js/issues/1255)
* **deps:** updated TinyTypes to 1.19.0 ([f6d53e4](https://github.com/serenity-js/serenity-js/commit/f6d53e4dbbfcb81139bd888ac11441b6344e47f5))


### Features

* **core:** support for registering custom RuntimeErrors with ErrorSerialiser ([feed78c](https://github.com/serenity-js/serenity-js/commit/feed78c6a5ed3c0ae3c614df69b29dbd4337d524))





# [3.0.0-rc.24](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.23...v3.0.0-rc.24) (2022-07-23)


### Bug Fixes

* **core:** improved how the interaction to Log reports names of the logged values ([c4cc60d](https://github.com/serenity-js/serenity-js/commit/c4cc60d0e1d4bdc34218566b1726e74d3ac40909))


### Features

* **core:** new interaction to Debug.values(..) and Debug.setBreakpoint() ([ef54324](https://github.com/serenity-js/serenity-js/commit/ef54324ca1b415d41eee12e7f4667cbffe2c8a01))





# [3.0.0-rc.23](https://github.com/serenity-js/serenity-js/compare/v2.33.10...v3.0.0-rc.23) (2022-07-19)


### Bug Fixes

* **node:** support for Node 18 ([73212bc](https://github.com/serenity-js/serenity-js/commit/73212bc9deb1998d871b0720a6b437687b3ceddc)), closes [#1243](https://github.com/serenity-js/serenity-js/issues/1243)



# [3.0.0-rc.22](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.21...v3.0.0-rc.22) (2022-07-15)


### Bug Fixes

* **core:** ensure all async operations complete before attempting to dismiss the actors ([635cd9a](https://github.com/serenity-js/serenity-js/commit/635cd9a07481a97017506577e24e92e32a02e0e9)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **core:** further improvements to stage/actor synchronisation ([1e2e6fb](https://github.com/serenity-js/serenity-js/commit/1e2e6fb5c4ac727d209e1c45d466d0485f4cf548))



# [3.0.0-rc.21](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.20...v3.0.0-rc.21) (2022-07-11)



# [3.0.0-rc.20](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.19...v3.0.0-rc.20) (2022-07-11)


### Bug Fixes

* **core:** corrected Wait so that polling stops when the timeout expires ([60677e7](https://github.com/serenity-js/serenity-js/commit/60677e700269f03fd08e2cd58c06df0ec9c71f6f))


### Features

* **core:** interaction to Wait stops upon errors ([56ff3eb](https://github.com/serenity-js/serenity-js/commit/56ff3ebd5366064f89be8ad3eefa53114ad12e85)), closes [#1035](https://github.com/serenity-js/serenity-js/issues/1035)
* **core:** interactions to Wait.for and Wait.until are now browser-independent ([d115142](https://github.com/serenity-js/serenity-js/commit/d1151427bed96c1ebd0d1dcc4159c6aeedc605de)), closes [#1035](https://github.com/serenity-js/serenity-js/issues/1035) [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
* **core:** minimum timeout and polling interval guards for Wait ([fd53d81](https://github.com/serenity-js/serenity-js/commit/fd53d81f5211eca18ba91729088d07883f2f9956)), closes [#1035](https://github.com/serenity-js/serenity-js/issues/1035)
* **web:** introduced PagesContext and implemented PlaywrightPage ([0045a72](https://github.com/serenity-js/serenity-js/commit/0045a726d540871333f644928218aed00bcd372c)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)



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

* **web:** replaced legacy PromiseLike return types with native Promise types ([436b3cb](https://github.com/serenity-js/serenity-js/commit/436b3cba1793f63008a56633cc93669736155ce6))



# [3.0.0-rc.14](https://github.com/serenity-js/serenity-js/compare/v2.33.3...v3.0.0-rc.14) (2022-03-28)


### Bug Fixes

* **web:** auto-generated descriptions of nested PageElements are easier to read ([5a51d91](https://github.com/serenity-js/serenity-js/commit/5a51d91f0abb1c32814c219a44da51d52df77f87))



# [3.0.0-rc.13](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.12...v3.0.0-rc.13) (2022-03-02)



# [3.0.0-rc.12](https://github.com/serenity-js/serenity-js/compare/v2.33.2...v3.0.0-rc.12) (2022-02-23)



# [3.0.0-rc.11](https://github.com/serenity-js/serenity-js/compare/v2.33.1...v3.0.0-rc.11) (2022-02-13)


### Bug Fixes

* **core:** updated dependency on error-stack-parser ([ea50285](https://github.com/serenity-js/serenity-js/commit/ea502855da40c2f95c893c75061ef6dcf12f669d))



# [3.0.0-rc.10](https://github.com/serenity-js/serenity-js/compare/v2.33.0...v3.0.0-rc.10) (2022-02-03)



# [3.0.0-rc.9](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.8...v3.0.0-rc.9) (2022-02-01)


### Features

* **web:** isVisible() works with Web elements in Shadow DOM ([cf84fb0](https://github.com/serenity-js/serenity-js/commit/cf84fb072a6b813338b68bb1dec3932ea8709e3e)), closes [#1085](https://github.com/serenity-js/serenity-js/issues/1085)



# [3.0.0-rc.8](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.7...v3.0.0-rc.8) (2022-01-28)


### Bug Fixes

* **core:** ensure Question.about doesn't expose internal interfaces ([4bfb6bc](https://github.com/serenity-js/serenity-js/commit/4bfb6bca6af81d23ced551f63df5bc9f35d581df)), closes [#1106](https://github.com/serenity-js/serenity-js/issues/1106)



# [3.0.0-rc.7](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.6...v3.0.0-rc.7) (2022-01-28)


### Bug Fixes

* **core:** removed deprecated interface DressingRoom; please use Cast instead ([d68b44b](https://github.com/serenity-js/serenity-js/commit/d68b44b545f50f6533523ab07008f9f89ac34433))
* **core:** removed deprecated interface WithStage ([45d1c2b](https://github.com/serenity-js/serenity-js/commit/45d1c2b3e0ff1946ccff97d148d0776f2fa60065))
* **core:** removed deprecated task to See.if ([dd5e2f5](https://github.com/serenity-js/serenity-js/commit/dd5e2f5c7e61444d40899f70d413f38bc9f6691a))


### Features

* **assertions:** isPresent works with any Optional ([cea75dc](https://github.com/serenity-js/serenity-js/commit/cea75dc1c728e45e06a87aaf9c1573a237334285)), closes [#1103](https://github.com/serenity-js/serenity-js/issues/1103)
* **core:** `f` and `d` question description formatters ([c9f3fad](https://github.com/serenity-js/serenity-js/commit/c9f3fadd86ec0196f2cdbf76d9628bbef0a3fcba))
* **core:** replaced `Adapter` with `QuestionAdapter` and introduced `Optional` ([8d84ad3](https://github.com/serenity-js/serenity-js/commit/8d84ad3863e3c726533d0f21934fb1e2fa8b3022)), closes [#1103](https://github.com/serenity-js/serenity-js/issues/1103)
* **core:** support for Optional chaining, expectation isPresent, refactored Expectations ([1841ee5](https://github.com/serenity-js/serenity-js/commit/1841ee5fc48cfa403ddc53358f75764d9a010c21)), closes [#1099](https://github.com/serenity-js/serenity-js/issues/1099) [#1099](https://github.com/serenity-js/serenity-js/issues/1099) [#1103](https://github.com/serenity-js/serenity-js/issues/1103)



# [3.0.0-rc.6](https://github.com/serenity-js/serenity-js/compare/v2.32.7...v3.0.0-rc.6) (2022-01-10)



# [3.0.0-rc.5](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.4...v3.0.0-rc.5) (2022-01-07)


### Bug Fixes

* **core:** screenplay Adapters will now correctly proxy calls to function-specific object keys ([ad6f1e6](https://github.com/serenity-js/serenity-js/commit/ad6f1e655ca77d6efde4461854e54c4113ca8fdd))



# [3.0.0-rc.4](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.3...v3.0.0-rc.4) (2021-12-30)


### Bug Fixes

* **core:** you can now retrieve the .length property of an Array wrapped in an Adapter<Array> ([c36e210](https://github.com/serenity-js/serenity-js/commit/c36e210c024052b96ba47e9663c7098e269c5688))



# [3.0.0-rc.3](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.2...v3.0.0-rc.3) (2021-12-29)


### Bug Fixes

* **core:** refactored Mappable so that it's easier to implement filters ([176e0cd](https://github.com/serenity-js/serenity-js/commit/176e0cd0303d63271477b2b7a8e7b0572dda99a0)), closes [#1074](https://github.com/serenity-js/serenity-js/issues/1074)
* **core:** removed interface Reducible since it's not used any more ([1e9f23b](https://github.com/serenity-js/serenity-js/commit/1e9f23b227e3c4509dd52d6885cde5d3ecd1d102))
* **deps:** updated tiny-types to 1.17.0 ([3187051](https://github.com/serenity-js/serenity-js/commit/3187051594158b4b450c82e851e417fd2ed21652))
* **web:** corrected synchronisation in Web questions and interactions ([c3a0ad1](https://github.com/serenity-js/serenity-js/commit/c3a0ad16de311e71d7e82e4f463baa0ca6b18863))


### Features

* **core:** forEach for List and PageElements ([4592fb7](https://github.com/serenity-js/serenity-js/commit/4592fb7e700bad17fd44d91bd9db169839802d01)), closes [#823](https://github.com/serenity-js/serenity-js/issues/823)
* **core:** List supports custom collectors ([cd3f2bc](https://github.com/serenity-js/serenity-js/commit/cd3f2bc1b536c8e56714aecd669bfed7ab078e0a))
* **core:** new implementation of List.where filters ([45b3c80](https://github.com/serenity-js/serenity-js/commit/45b3c8080ca467ac6362e5217e7899ca36a04cdc)), closes [#1074](https://github.com/serenity-js/serenity-js/issues/1074)
* **core:** support for Screenplay-style collection filters and mapping (List.where & .eachMappedTo) ([3d3c02e](https://github.com/serenity-js/serenity-js/commit/3d3c02ebe0ec5c6865f91f1991fd59ef0190a16c)), closes [#1074](https://github.com/serenity-js/serenity-js/issues/1074)
* **web:** re-introduced PageElements.where DSL and universal By selectors ([39fe0a1](https://github.com/serenity-js/serenity-js/commit/39fe0a10edf7f652e93911159e4a4689c36d6876)), closes [#1081](https://github.com/serenity-js/serenity-js/issues/1081)



# [3.0.0-rc.1](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.0...v3.0.0-rc.1) (2021-12-09)



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
* **web:** wordsmithing of interface names ([5a1e76a](https://github.com/serenity-js/serenity-js/commit/5a1e76a9c162370e17238fcccc9f08e109d543c3))


### Features

* **core:** question.about creates a proxy around the answer to simplify the API ([25e0841](https://github.com/serenity-js/serenity-js/commit/25e084116ad28a02b55fbd8814b6ffa0375ec433))
* **core:** question.about produces "props" that proxy the methods of the underlying model ([f771872](https://github.com/serenity-js/serenity-js/commit/f771872c56b487e404002c3800fc8f3baaed804f))
* **web:** Page.url() and Page.title() replace Website.url() and Website.title() ([49fe009](https://github.com/serenity-js/serenity-js/commit/49fe0094422ab53ec67d4ba303f80c33e382eebd)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** removed Target in favour of PageElement ([69496c4](https://github.com/serenity-js/serenity-js/commit/69496c47c4a1ec7b92e7ab6c83da1559e926f28e)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)
* **web:** support for working with cookies ([39cde6d](https://github.com/serenity-js/serenity-js/commit/39cde6de7a36d27a8b1c596493efbec94900af6b)), closes [#805](https://github.com/serenity-js/serenity-js/issues/805)


### BREAKING CHANGES

* **core:** Introduced @serenity-js/web - a shared library for Serenity/JS Web integration
modules such as @serenity-js/protractor and @serenity-js/webdriverio. Dropped support for Node 12.
