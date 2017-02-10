# Installation

To fully benefit from Serenity/JS and to implement test scenarios using 
the [Screenplay Pattern](../../design/screenplay-pattern.md) and either 
[Cucumber](cucumber.md) 
or [Mocha](mocha.md) you'll need the core `serenity-js` module, 
but also a couple of other dependencies.

To get them, execute the below terminal command:

<pre><code class="lang-bash">$> npm install serenity-js serenity-cli typescript ts-node protractor@{{ book.package.peerDependencies.protractor }} @types/node --save-dev
</code></pre>

To implement your test scenarios using [Cucumber](cucumber.md) you'll also need the following dependencies:

```bash
$> npm install cucumber@1.x @types/cucumber --save-dev
```

or, to use [Mocha](mocha.md), install the following instead:

```bash
$> npm install mocha @types/mocha --save-dev
```

The one last thing you need is an assertion library, such as [Chai.js](chaijs.com), which can be uses with either one
of the above test frameworks:

```bash
$> npm install chai chai-as-promised chai-smoothie @types/chai @types/chai-as-promised --save-dev
```

## Dependencies

Let's have a quick look at the roles and responsibilities of the Node.js modules you've just installed.

| module                                                 | roles and responsibilities |
| ------------------------------------------------------ | -------------------------- |
| [serenity-js](https://npmjs.com/package/serenity-js)   | <h4>Acceptance testing library</h4><ul><li>acts as an integration layer between Protractor and a test framework of your choice</li><li>provides building blocks of the Screenplay Pattern</li><li>records the execution of your test scenarios</li></ul> |
| [serenity-cli](https://npmjs.com/package/serenity-cli) | <h4>A Node.js wrapper around Serenity BDD CLI</h4><ul><li>downloads, configures and executes the Serenity BDD CLI <code>jar</code>, which is responsible for processing the JSON reports recorded by <code>serenity-js</code> and producing a HTML version</li></ul> |             
| [typescript](https://npmjs.com/package/typescript)     | <h4>A typed super-set of JavaScript ES6</h4><ul><li>helps write code more efficiently and take advantage of tooling for identifying issues and automatically filling in parameters, properties, functions and more (often known as IntelliSense or Code Completion in modern IDEs)</li><li><a href="https://www.typescriptlang.org/" target="_blank">learn more about TypeScript</a></li><li><a href="https://johnpapa.net/es5-es2015-typescript/" target="_blank">find out about the commonalities and differences between ES5, ES6 and TypeScript</a></li></ul> |           
| [ts-node](https://npmjs.com/package/ts-node)           | <h4>TypeScript Execution environment and REPL for Node.js</h4><ul><li>allows for in-memory execution of TypeScript code on Node.js, without the need for any additional transpilers such as <a href="https://babeljs.io/" target="_blank">Babel</a>, or intermediate files that you'd get with the TypeScript compiler alone</li></ul> |        
| [protractor@{{ book.package.peerDependencies.protractor }}](https://npmjs.com/package/protractor) | <h4>A wrapper around Selenium/WebDriver</h4><ul><li>enables end-to-end and integration testing of web applications</li><li>manages Selenium/WebDriver binaries</li><li>manages the lifecycle of the browser used in web-based tests</li><li>provides support for Angular-based applications</li><li>can be used to drive non-Angular apps too</li></ul> |                 
| [cucumber@1.x](https://npmjs.com/package/cucumber)     | <h4>Collaboration library</h4><ul><li>helps with introducing BDD</li><li>allows for expressing test scenarios in a human-readable language, such as English</li><li>parses the human-readable scenarios, links their steps with the test automation code provided by <code>serenity-js</code></li><li>executes Serenity/JS test scenarios</li></ul> |             
| [mocha](https://npmjs.com/package/mocha)               | <h4>Test execution library</h4><ul><li>a light-weight test execution library, excellent for regression testing of existing apps</li><li>executes Serenity/JS test scenarios</li></ul> |       
| [chai](https://npmjs.com/package/chai)                 | <h4>Assertion library</h4><ul><li>a BDD-style assertion library, providing highly readable assertion functions</li></ul> |      
| [chai-as-promised](https://npmjs.com/package/chai-as-promised)               | <h4><code>Promise</code>-specific assertions for Chai</h4><ul><li>assertions for functions and methods returning <a href="https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank"><code>Promises</code></a></li></ul> |                  
| [chai-smoothie](https://npmjs.com/package/chai-smoothie)                     | <h4>Protractor-specific assertions for Chai</h4><ul><li>assertions verifying visibility of web elements</li><li>improve Protractor's error messages</li><li>come with type definitions</li></ul> |               
| [@types/chai](https://npmjs.com/package/@types/chai)                         | <h4>Type definitions for Chai</h4><ul><li>IntelliSense support for Chai</li></ul>  |
| [@types/chai-as-promised](https://npmjs.com/package/@types/chai-as-promised) | <h4>Type definitions for Chai-as-promised</h4><ul><li>IntelliSense support for Chai-as-promised</li></ul>  |                        
| [@types/cucumber](https://npmjs.com/package/@types/cucumber)                 | <h4>Type definitions for Cucumber.js</h4><ul><li>IntelliSense support for Cucumber.js</li></ul> |               
| [@types/node](https://npmjs.com/package/@types/node)                         | <h4>Type definitions for Node.js</h4><ul><li>IntelliSense support for Node.js core libraries</li></ul> |            
| [@types/mocha](https://npmjs.com/package/@types/mocha)                       | <h4>Type definitions for Mocha</h4><ul><li>IntelliSense support for Mocha</li></ul> |             

{% include "../_partials/feedback.md" %} 