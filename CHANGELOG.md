# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
