---
title: Installation
layout: handbook.hbs
---
# Installation

All the official Serenity/JS modules are distributed via the Node Package Manager repository - [npmjs.com](https://www.npmjs.com/search?q=%40serenity-js) and follow the `@serenity-js/*` naming convention.

Once you [have decided](/handbook/integration/architecture.html) on the [Serenity/JS modules](/modules) you'd like to use in your test suite, you can install them by running `npm install --save-dev`, followed by the names of the modules. For example:

```text
npm install --save-dev \
    @serenity-js/assertions \
    @serenity-js/console-reporter \
    @serenity-js/core \
    @serenity-js/cucumber \
    @serenity-js/protractor \
    @serenity-js/rest \
    @serenity-js/serenity-bdd
```

Please make sure to always update the modules together and use the same version number for all the `@serenity-js/*` modules you depend on. Learn more about [versioning](/handbook/integration/versioning.html).

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    The easiest way to get started with Serenity/JS is by using one of the [template projects available on GitHub](https://github.com/serenity-js/). Serenity/JS template project come with appropriate Serenity/JS modules and lower-level integration and test tools already configured.
    </p></div>
</div>
