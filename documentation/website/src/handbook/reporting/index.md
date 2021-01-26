---
title: Reporting
layout: handbook.hbs
---
# Reporting

Just like the [design patterns](/handbook/design/index.html) in your Serenity/JS scenarios revolve around the [system metaphor](http://www.extremeprogramming.org/rules/metaphor.html) of a [stage performance](/handbook/thinking-in-serenity-js/screenplay-pattern.html), Serenity/JS support and reporting services follow the metaphor of a [stage crew](https://en.wikipedia.org/wiki/Running_crew).

The [`StageCrewMembers`](/modules/core/class/src/stage/StageCrewMember.ts~StageCrewMember.html) observe the [`Actors`](/handbook/design/actors.html) on [`Stage`](/modules/core/class/src/stage/Stage.ts~Stage.html), watch the [`Activities`](/modules/core/class/src/screenplay/Activity.ts~Activity.html) they perform, and listen to the [`DomainEvents`](/modules/core/identifiers.html#events) emitted by their environment. They use the information they gather to produce [`Artifacts`](/modules/core/class/src/model/Artifact.ts~Artifact.html), such as test reports, produce more events to prompt other crew members to action, or perform side-effects like printing to the terminal, writing files to disk, or performing network or database calls.

Several of the Serenity/JS modules provide [`StageCrewMembers`](/modules/core/class/src/stage/StageCrewMember.ts~StageCrewMember.html) you can use for test reporting purposes:
- [`@serenity-js/console-reporter`](/modules/console-reporter) - provides the [`ConsoleReporter`](/modules/console-reporter/class/src/stage/crew/console-reporter/ConsoleReporter.ts~ConsoleReporter.html), which writes text-based test reports to your computer terminal,
- [`@serenity-js/serenity-bdd`](/modules/serenity-bdd) - provides the [`SerenityBDDReporter`](/modules/serenity-bdd/class/src/stage/crew/serenity-bdd-reporter/SerenityBDDReporter.ts~SerenityBDDReporter.html), which emits [Serenity BDD](https://serenity-bdd.github.io/theserenitybook/latest/index.html)-compatible JSON reports, to be archived via [`ArtifactArchiver`](/modules/core/class/src/stage/crew/artifact-archiver/ArtifactArchiver.ts~ArtifactArchiver.html) and consumed by the [Serenity BDD CLI](/modules/serenity-bdd/#serenity-bdd-living-documentation) to produce HTML reports and living documentation,
- [`@serenity-js/core`](/modules/core) - provides the [`ArtifactArchiver`](/modules/core/class/src/stage/crew/artifact-archiver/ArtifactArchiver.ts~ArtifactArchiver.html), which store the artifacts on disk, as well as the [`StreamReporter`](/modules/core/class/src/stage/crew/stream-reporter/StreamReporter.ts~StreamReporter.html), which logs any events it receives.

You can also create your own `StageCrewMembers` based on the above examples.
