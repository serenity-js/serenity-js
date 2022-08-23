---
sidebar_position: 6
---
# Versioning

Serenity/JS complies with [Semantic Versioning 2.0.0](https://semver.org/), with release versions [determined automatically](/contributing) based on the changes introduced to the `main` branch since the most recent release.

All [Serenity/JS modules](/api) are typically released together, even if not all of them have changed in a given release.
This is to make it easier for you to stay up to date without having to worry about any compatibility issues between the framework's modules.

## Deprecated APIs

The [public APIs](/api) of the framework will not be removed or changed in a backward-incompatible way in minor or patch releases of the framework. However, from time to time some APIs might get marked as `@deprecated`.

When an API is marked as `@deprectated`, the documentation of the API will provide instructions on what other API has superseded the deprecated one. Additionally, a ticket marked as [`deprecation-notice`](https://github.com/serenity-js/serenity-js/labels/deprecation-notice) is raised on Serenity/JS GitHub, and you'll have at least 3 months since the ticket is raised to migrate the code using a deprecated api to the new alternative.

Removing a deprecated API will not affect the major version number of the Serenity/JS framework.

You can [watch](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository) the [Serenity/JS GitHub](https://github.com/serenity-js/serenity-js) repository to be notified of deprecated APIs. 

## Experimental APIs

In order to enable early feedback, from time to time experimental APIs are introduced to the framework. Those APIs are clearly marked as `@experimental`.

When a new experimental API is introduced to the framework, a ticket marked as [`experiment`](https://github.com/jan-molak/serenity-js/labels/experiment) will be raised on Serenity/JS GitHub, so you're encouraged to give the idea [a thumbs up](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-conversations-on-github#reacting-to-ideas-in-comments) or provide suggestions on how it could be improved.
 
Please be aware that experimental APIs might change or get removed without prior notice and without affecting the major version number of the Serenity/JS framework.

You can [watch](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository) the [Serenity/JS GitHub](https://github.com/serenity-js/serenity-js) repository to be notified of experimental APIs.
