---
title: Contributing
layout: handbook.hbs
---
# Contributing

Thanks for considering contributing your time and talent to help Serenity/JS move forward!

You're awesome &#x1F60A;

## The Serenity/JS Handbook

The Serenity/JS Handbook is an evolving project and there are parts of the book that you might find incomplete, or simply not written yet.

You can contribute to the evolution of the Serenity/JS Handbook by:
- correcting any errors you find - via <i class="far fa-edit"></i> Edit on GitHub
- sharing your ideas for topics you'd like to see covered - via [GitHub issues](https://github.com/serenity-js/serenity-js/issues/new)
- sponsoring the Serenity/JS project - via [GitHub Sponsors](https://github.com/sponsors/serenity-js)

<a class="github-button" href="https://github.com/sponsors/serenity-js" data-icon="octicon-heart" data-size="large" aria-label="Sponsor Serenity/JS on GitHub">Sponsor</a>

## The Serenity/JS Framework

If you have a question about the framework or its features, please check out the [support documentation](/support.html).

### Reporting defects

If you believe you have found a bug in Serenity/JS please raise a ticket on [Serenity/JS GitHub](https://github.com/serenity-js/serenity-js).

When reporting a bug, please kindly remember to:
- Give the ticket a succinct yet descriptive **title** (i.e. Feature X is broken vs, Feature X is not triggered upon event Y)
- Mention the **environment** where you [spotted the bug](https://cartoontester.blogspot.com/2012/02/art-of-bug-reporting.html). What was the browser and operating system? What versions of [runtime dependencies](/handbook/integration/runtime-dependencies.html) did you use?
- Provide a **detailed description** of what happened and don’t leave any important facts out. That said, try not to include any extraneous details that could derail or distract the people trying to help reproduce the issue you found.
- Explain how the behaviour you observed is different from what you believe should have happened instead
- Provide supplementary information:
    - If you can reproduce and isolate the issue, use one of the Serenity/JS template repositories to create a minimalistic example that demonstrates the problem and attach a link to it to your ticket. While this requires a bit more work on your side, it will help us sort out the problem much quicker.
    - If you can reproduce the issue, but can't isolate it, add the [`StreamReporter`](/modules/core/class/src/stage/crew/stream-reporter/StreamReporter.ts~StreamReporter.html) to your Serenity/JS stage crew, run the test again to trigger the bug, and attach the [`StreamReporter`'s](/modules/core/class/src/stage/crew/stream-reporter/StreamReporter.ts~StreamReporter.html)  log to your ticket
    - If you can't reproduce the issue, please attach any additional information that might help us figure out what happened - screenshots and test execution logs are particularly useful. 

### Proposing enhancements

Serenity/JS is an open source project that's open to your contributions and [pull requests](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests).

Before putting your time and effort into a pull request, though, please gauge the potential interest in your idea either by raising a ticket on [Serenity/JS GitHub](https://github.com/serenity-js/serenity-js/issues/new) or chatting with the development team on the [Contributors Channel](https://gitter.im/serenity-js/Contributors) on Gitter.

[![Gitter](https://badges.gitter.im/serenity-js/Contributors.svg)](https://gitter.im/serenity-js/Contributors?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

#### Working with the Serenity/JS code base

If you have decided to raise a pull request, you'll need to:
- [Fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) the [Serenity/JS mono-repo](https://github.com/serenity-js/serenity-js) to your GitHub account
- [Clone](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) your fork to your machine
- Make sure you have the [runtime dependencies](/handbook/integration/runtime-dependencies.html) installed
- Install the Node.js dependencies by running `make install` in the project root. Serenity/JS uses [Lerna.js](https://github.com/lerna/lerna) to manage the `@serenity-js/*` modules you'll find in the mono-repo, so it will take care of propagating the `npm ci` and other commands to the modules.
- Make sure you can build the Serenity/JS project on your machine and all the unit- and integration tests are passing before introducing any changes
- Introduce the changes you wish to propose and update or introduce any unit- and integration tests that might be affected.
- Run the **full local build** before committing
- Commit your changes using `npm run commit` and describe them using the [Commitizen wizard](https://github.com/commitizen). Serenity/JS uses an automated release process so it's important that your commit messages follow the required format, which Commitizen can generate for you.

#### Project structure

In the project root directory, you'll find the following sub-directories
- `packages` - this is where all the [Serenity/JS modules](/modules) and their associated unit tests live
- `integration` - this is the home of integration tests that exercise the Serenity/JS modules once they're transpiled from TypeScript to JavaScript
- `examples` - when the changes you want to introduce pass their unit tests and integration tests, you can use the mini-projects located here for exploratory testing and experimentation. Those example projects simulate the framework's target execution environment, so you can use them to look at your changes from the perspective of people who'll be using them soon!  

#### Building Serenity/JS

Serenity/JS [Makefile](https://github.com/serenity-js/serenity-js/blob/master/Makefile) drives the entire build process. 

Here's a list of commands you'll need to build and test Serenity/JS locally:
- `make` - same as running `make install clean compile`
- `make install` - installs dependencies across the Serenity/JS monorepo
- `make clean` - removes any build and test artifacts.
- `make clean test` - removes build artifacts and executes the unit tests located under `packages/*/spec` in memory using [ts-node](https://github.com/TypeStrong/ts-node). This is so that you don't have to transpile TypeScript to JavaScript before running the tests
- `make clean integration-test` - removes build artifacts and executes the integration tests located under `integration/*/spec` in memory using [ts-node](https://github.com/TypeStrong/ts-node). This is so that you don't have to transpile TypeScript to JavaScript before running the tests
- `make clean verify` - removes build artifacts, runs the linter, transpiles TypeScript to JavaScript, runs the unit tests, runs the integration tests located under `integration/*/` 
- `make clean verify report site` - same as verify, but additionally generates test reports and produces the serenity-js.org website. This is the **full local build** you should run at least once before committing your changes and submitting the pull request.

If you encounter any issues, let us know on the [Serenity/JS Contributors Channel](https://gitter.im/serenity-js/Contributors) on Gitter.
