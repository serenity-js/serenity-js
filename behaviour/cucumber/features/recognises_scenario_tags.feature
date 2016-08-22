@cucumber
Feature: Recognises scenario tags

  @regression @issue:MY-PROJECT-123
  Scenario: A regression test covering one issue
    Given a step that passes

  @regression @issues:MY-PROJECT-123,MY-PROJECT-789
  Scenario: A regression test covering two issues
    Given a step that passes