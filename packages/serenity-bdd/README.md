# Serenity BDD

[`@serenity-js/serenity-bdd`](https://serenity-js.org/api/serenity-bdd/) 
enables Serenity BDD reports and living documentation for your Serenity/JS test suites.

## Features

- Generates rich HTML and JSON reports
- Integrates with Cucumber, Mocha, Jasmine, Playwright, and WebdriverIO
- Supports tags, screenshots, and step-level reporting

## Installation

```sh
npm install --save-dev @serenity-js/core @serenity-js/serenity-bdd
```

See the [Serenity/JS Installation Guide](https://serenity-js.org/handbook/installation/).

## Quick Start

```typescript
import { configure } from '@serenity-js/core';

configure({
    crew: [
        [ '@serenity-js/serenity-bdd', {
            specDirectory: './spec',
            reporter: {
                includeAbilityDetails: true,
            },
        } ],
        [ '@serenity-js/core:ArtifactArchiver', {
            outputDirectory: './target/site/serenity'
        } ],
    ]
})
```

Explore practical examples and in-depth explanations in the [Serenity/JS Handbook](https://serenity-js.org/handbook/).

## Configuration

See the [Serenity BDD Reporter Configuration Guide](https://serenity-js.org/handbook/reporting/serenity-bdd-reporter/)
and [best practices](https://serenity-js.org/handbook/reporting/serenity-bdd-reporter/#serenity-bdd-best-practices).

## Documentation

- [API Reference](https://serenity-js.org/api/)
- [Screenplay Pattern Guide](https://serenity-js.org/handbook/design/screenplay-pattern/)
- [Serenity/JS Project Templates](https://serenity-js.org/handbook/project-templates/)
- [More examples and reference implementations](https://github.com/serenity-js/serenity-js/tree/main/examples)
- [Tutorial: First Web Scenario](https://serenity-js.org/handbook/tutorials/your-first-web-scenario/)
- [Tutorial: First API Scenario](https://serenity-js.org/handbook/tutorials/your-first-api-scenario/)

## Contributing

Contributions of all kinds are welcome! Get started with
the [Contributing Guide](https://serenity-js.org/community/contributing/).

## Community

- [Community Chat](https://matrix.to/#/#serenity-js:gitter.im)
- [Discussions Forum](https://github.com/orgs/serenity-js/discussions)
    - Visit the [💡How to... ?](https://github.com/orgs/serenity-js/discussions/categories/how-to) section for answers to
      common questions

If you enjoy using Serenity/JS, make sure to star ⭐️ [Serenity/JS on GitHub](https://github.com/serenity-js/serenity-js)
to help others discover the framework!

## License

The Serenity/JS code base is licensed under the [Apache-2.0](https://opensource.org/license/apache-2-0) license,
while its documentation and the [Serenity/JS Handbook](https://serenity-js.org/handbook/) are licensed under
the [Creative Commons BY-NC-SA 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).

See the [Serenity/JS License](https://serenity-js.org/legal/license/).

## Support

Support ongoing development through [GitHub Sponsors](https://github.com/sponsors/serenity-js). Sponsors gain access
to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks)
and priority help in the [Discussions Forum](https://github.com/orgs/serenity-js/discussions).

For corporate sponsorship or commercial support, please contact [Jan Molak](https://www.linkedin.com/in/janmolak/).

[![GitHub Sponsors](https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js).
