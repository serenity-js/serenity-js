Feature: Serenity/JS recognises pending scenarios

  Scenario: A scenario with steps marked as pending

    Given a step that's marked as pending

  Scenario: A scenario with steps that have not been implemented yet

    Given a step that hasn't been implemented yet


  @wip
  Scenario: A scenario which tag marks it as pending

    The @wip tag is interpreted as pending thanks to support/wip_hook.ts
    Every step in this scenario will be reported as pending.

    Given step number one that passes
      And step number two that is marked as pending
      And step number three that fails
