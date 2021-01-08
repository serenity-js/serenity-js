Feature: Serenity/JS recognises skipped scenarios

  @skip
  Scenario: A scenario which tag marks it as skipped

  The @skip tag is interpreted as pending thanks to support/wip_hook.ts
  Every step in this scenario will be reported as pending.

    Given step number one that passes
