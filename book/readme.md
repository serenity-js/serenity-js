<h1><img alt="Serenity/JS" src="../images/serenity-js.svg" id="cover-logo" /></h1>

A handbook by [Jan Molak](https://janmolak.com)

----

> Serenity/JS makes acceptance and regression testing of modern web applications
faster, more collaborative and easier to scale.

**Serenity/JS is a next generation open-source acceptance testing library which gives you:**
* **the flexibility and expressiveness of the [Screenplay Pattern](scenarios/screenplay-pattern.md)**,<br />
  _so that your test scenarios stay free of noise and focused on the business logic_,
* **the power and visibility of [Serenity BDD](http://serenity-bdd.info/#/documentation)
[narrative reports](http://serenity-bdd.info/docs/serenity/#_detailed_description_of_aggregation_reports)**,<br />
  _so that failure analysis and release readiness assessment become more efficient_,
* **an easy way to introduce and follow [SOLID design principles](https://en.wikipedia.org/wiki/SOLID_&#40;object-oriented_design&#41;)**,<br />
  _to keep your code simple, reusable and easy to extend_,
* **easy integration with popular test automation tools,
  like [Protractor](https://github.com/angular/protractor), [Cucumber](https://github.com/cucumber/cucumber-js) and [Chai](http://chaijs.com/)**,<br />
  _so that you can introduce it into your existing toolchain *today*_!

----

Although Serenity/JS provides a strong support for automating web tests using Protractor and Webdriver,
it works very effectively for non-web tests too! 
Those could include tests that exercise web services or even call application code directly.

Check out the [introduction](introduction.md) to see Serenity/JS in action 
or get your hands dirty with [the tutorial](from-scripts-to-serenity/readme.md)! 

----

<p>
<a class="image" href="https://badge.fury.io/js/serenity-js" target="_blank"><img src="https://badge.fury.io/js/serenity-js.svg" alt="npm version"></a>
<a class="image" href="https://travis-ci.org/jan-molak/serenity-js" target="_blank"><img src="https://travis-ci.org/jan-molak/serenity-js.svg?branch=master" alt="Build Status"></a>
<a class="image" href="https://coveralls.io/github/jan-molak/serenity-js" target="_blank"><img src="https://coveralls.io/repos/github/jan-molak/serenity-js/badge.svg" alt="Coverage Status"></a>
<a class="image" href="https://david-dm.org/jan-molak/serenity-js" target="_blank"><img src="https://david-dm.org/jan-molak/serenity-js.svg" alt="Dependencies"></a>
<a class="image" href="https://github.com/semantic-release/semantic-release" target="_blank"><img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="semantic-release"></a>
</p>

_Serenity/JS Handbook was generated on the {{ gitbook.time | date('Do of MMMM YYYY') }} 
and covers Serenity/JS version 
[{{ book.api_version }}](https://github.com/jan-molak/serenity-js/releases/tag/v{{ book.api_version }})._