<a name="1.10.6"></a>
## 1.10.6 (2018-01-21)



<a name="1.10.3"></a>
## 1.10.3 (2018-01-21)



<a name="1.10.3"></a>
## 1.10.3 (2018-01-21)



<a name="1.10.3"></a>
## 1.10.3 (2018-01-21)



<a name="1.10.3"></a>
## 1.10.3 (2018-01-21)


### Bug Fixes

* **protractor:** select.theValue() interaction is correctly reported ([06bca4a](https://github.com/jan-molak/serenity-js/commit/06bca4a))



<a name="1.10.2"></a>
## 1.10.2 (2018-01-10)


### Bug Fixes

* **dependencies:** bumped version of [@serenity-js](https://github.com/serenity-js)/core to bring in the updated Question.about interf ([6ea298d](https://github.com/jan-molak/serenity-js/commit/6ea298d))



<a name="1.10.1"></a>
## 1.10.1 (2017-11-14)


### Bug Fixes

* **cucumber:** correctly hanlde --strict and --no-color flags ([878a165](https://github.com/jan-molak/serenity-js/commit/878a165))



<a name="1.10.0"></a>
# 1.10.0 (2017-11-08)


### Features

* **protractor:** 'serenity-js/protractor' gives easy access to 'serenity-js/lib/screenplay-protractor' ([029e5f4](https://github.com/jan-molak/serenity-js/commit/029e5f4))



<a name="1.9.4"></a>
## 1.9.4 (2017-11-05)


### Bug Fixes

* **protractor:** hit interaction reports the name of the actor correctly ([bcf6151](https://github.com/jan-molak/serenity-js/commit/bcf6151))



<a name="1.9.3"></a>
## 1.9.3 (2017-10-22)


### Bug Fixes

* **protractor:** executeScript and ExecuteAsyncScript will accept any type of arguments (not only Ta ([3778a32](https://github.com/jan-molak/serenity-js/commit/3778a32))



<a name="1.9.2"></a>
## 1.9.2 (2017-10-01)


### Bug Fixes

* **deps:** updated [@serenity-js](https://github.com/serenity-js)/core to 1.5.3 ([5a777f0](https://github.com/jan-molak/serenity-js/commit/5a777f0))



<a name="1.9.1"></a>
## 1.9.1 (2017-09-27)


### Bug Fixes

* **reporting:** wait.until(target, Is.present()) was incorrectly reported ([9fdbea0](https://github.com/jan-molak/serenity-js/commit/9fdbea0))



<a name="1.9.0"></a>
# 1.9.0 (2017-09-26)


### Features

* **config:** output directory is configurable ([03b2842](https://github.com/jan-molak/serenity-js/commit/03b2842)), closes [#45](https://github.com/jan-molak/serenity-js/issues/45)



<a name="1.8.1"></a>
## 1.8.1 (2017-09-25)


### Bug Fixes

* **protractor:** target.of() Dynamic selector accepts both string and number arguments ([a710f61](https://github.com/jan-molak/serenity-js/commit/a710f61)), closes [#93](https://github.com/jan-molak/serenity-js/issues/93)



<a name="1.8.0"></a>
# 1.8.0 (2017-07-15)


### Features

* **protractor:** support for multi-capability tests ([bdeb5fb](https://github.com/jan-molak/serenity-js/commit/bdeb5fb)), closes [#61](https://github.com/jan-molak/serenity-js/issues/61)



<a name="1.7.0"></a>
# 1.7.0 (2017-06-13)


### Features

* **protractor:** switch task lets you switch between popup windows ([fdedf8a](https://github.com/jan-molak/serenity-js/commit/fdedf8a))



<a name="1.6.2"></a>
## 1.6.2 (2017-06-11)


### Bug Fixes

* **dependencies:** bumped [@serenity-js](https://github.com/serenity-js)/core ([b1c1721](https://github.com/jan-molak/serenity-js/commit/b1c1721))



<a name="1.6.1"></a>
## 1.6.1 (2017-06-11)


### Bug Fixes

* **screenplay:** corrected the return type expected by the Question interface ([58ed941](https://github.com/jan-molak/serenity-js/commit/58ed941)), closes [#57](https://github.com/jan-molak/serenity-js/issues/57)



<a name="1.6.0"></a>
# 1.6.0 (2017-06-11)


### Features

* **core:** [@serenity-js](https://github.com/serenity-js)/core is independent of Protractor ([5dc4dd1](https://github.com/jan-molak/serenity-js/commit/5dc4dd1)), closes [#6](https://github.com/jan-molak/serenity-js/issues/6)



<a name="1.5.0"></a>
# 1.5.0 (2017-05-13)


### Bug Fixes

* **protractor:** a Target's name can use the "{0}" token, same as the locator ([6a03291](https://github.com/jan-molak/serenity-js/commit/6a03291))
* **protractor:** corrected the Enter interaction so that the entered value is reported ([fe58c2a](https://github.com/jan-molak/serenity-js/commit/fe58c2a))


### Features

* **core:** anonymous Tasks can be created using \`Task.where(description, ...sub-tasks)\` ([13f33cc](https://github.com/jan-molak/serenity-js/commit/13f33cc)), closes [#22](https://github.com/jan-molak/serenity-js/issues/22)
* **protractor:** \`Scroll.to(target)\` moves the browser view port to a specific target. ([48239b3](https://github.com/jan-molak/serenity-js/commit/48239b3))



<a name="1.4.2"></a>
## 1.4.2 (2017-05-03)


### Bug Fixes

* **core:** fixes maximum call stack size reached in [@step](https://github.com/step) ([1a8ad0f](https://github.com/jan-molak/serenity-js/commit/1a8ad0f)), closes [#38](https://github.com/jan-molak/serenity-js/issues/38)



<a name="1.4.1"></a>
## 1.4.1 (2017-04-28)


### Bug Fixes

* **core:** both the [@step](https://github.com/step) and Activity::toString can use an #actor token instead of {0} ([a1da923](https://github.com/jan-molak/serenity-js/commit/a1da923)), closes [#22](https://github.com/jan-molak/serenity-js/issues/22)



<a name="1.4.0"></a>
# 1.4.0 (2017-04-26)


### Features

* **core:** support for ES6-style task definitions ([fff470a](https://github.com/jan-molak/serenity-js/commit/fff470a)), closes [#22](https://github.com/jan-molak/serenity-js/issues/22) [#18](https://github.com/jan-molak/serenity-js/issues/18) [#21](https://github.com/jan-molak/serenity-js/issues/21) [#21](https://github.com/jan-molak/serenity-js/issues/21) [#22](https://github.com/jan-molak/serenity-js/issues/22)
* **protractor:** JetBrains tools should be able to report scenario duration ([3afb8fc](https://github.com/jan-molak/serenity-js/commit/3afb8fc))



<a name="1.3.0"></a>
# 1.3.0 (2017-04-12)


### Bug Fixes

* **cucumber,mocha:** the stageCue timeout is configurable ([256d29b](https://github.com/jan-molak/serenity-js/commit/256d29b)), closes [#34](https://github.com/jan-molak/serenity-js/issues/34)


### Features

* **interactions:** useAngular.disableSynchronisation() and UseAngular.enableSynchronisation() inter ([3b1a3b5](https://github.com/jan-molak/serenity-js/commit/3b1a3b5))



<a name="1.2.4"></a>
## 1.2.4 (2017-03-31)


### Bug Fixes

* **browserstack:** increase default timeout to 30s to allow for the screenshots to be downloaded fro ([d0fa17e](https://github.com/jan-molak/serenity-js/commit/d0fa17e)), closes [#34](https://github.com/jan-molak/serenity-js/issues/34)



<a name="1.2.3"></a>
## 1.2.3 (2017-03-24)


### Bug Fixes

* **integration:** cleanup of TestFrameworkAdapter interfaces ([873c19c](https://github.com/jan-molak/serenity-js/commit/873c19c))



<a name="1.2.2"></a>
## 1.2.2 (2017-03-17)


### Bug Fixes

* **node version:** update the node version with >= 6.9.0 to support node v6.10.0 ([6867a90](https://github.com/jan-molak/serenity-js/commit/6867a90))



<a name="1.2.1"></a>
## 1.2.1 (2017-03-03)



