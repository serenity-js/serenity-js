Feature: Recognises scenario results

  Scenario: A passing scenario
    Given a step that passes

  Scenario: A failing scenario
    Given a step that fails

  Scenario: A pending scenario
    Given a scenario with no defined steps

  @wip
  Scenario: A skipped scenario
    Given a scenario that is never executed