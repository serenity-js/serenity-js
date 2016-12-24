@cucumber
Feature: Recognises scenario tags

  @regression @issue:MY-PROJECT-123
  Scenario: A regression test covering one issue
    Given a step that passes
