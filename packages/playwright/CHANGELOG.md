# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0-rc.24](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.23...v3.0.0-rc.24) (2022-07-23)


### Bug Fixes

* **playwright:** upgraded Playwright to 1.24.0 ([9f8d491](https://github.com/serenity-js/serenity-js/commit/9f8d491cefd893ed7730c55f4186e4b3ffcc0e1d))





# [3.0.0-rc.23](https://github.com/serenity-js/serenity-js/compare/v2.33.10...v3.0.0-rc.23) (2022-07-19)


### Bug Fixes

* **node:** support for Node 18 ([73212bc](https://github.com/serenity-js/serenity-js/commit/73212bc9deb1998d871b0720a6b437687b3ceddc)), closes [#1243](https://github.com/serenity-js/serenity-js/issues/1243)



# [3.0.0-rc.22](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.21...v3.0.0-rc.22) (2022-07-15)



# [3.0.0-rc.21](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.20...v3.0.0-rc.21) (2022-07-11)



# [3.0.0-rc.20](https://github.com/serenity-js/serenity-js/compare/v3.0.0-rc.19...v3.0.0-rc.20) (2022-07-11)


### Bug Fixes

* **web:** renamed PagesContext to BrowsingSession to make the name more descriptive ([6b4e998](https://github.com/serenity-js/serenity-js/commit/6b4e9984d80f8f349f367e59bd0e615cd01703ec)), closes [#1236](https://github.com/serenity-js/serenity-js/issues/1236)


### Features

* **core:** interactions to Wait.for and Wait.until are now browser-independent ([d115142](https://github.com/serenity-js/serenity-js/commit/d1151427bed96c1ebd0d1dcc4159c6aeedc605de)), closes [#1035](https://github.com/serenity-js/serenity-js/issues/1035) [#1236](https://github.com/serenity-js/serenity-js/issues/1236)
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
