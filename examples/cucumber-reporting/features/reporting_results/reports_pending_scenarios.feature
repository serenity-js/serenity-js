Feature: Reports pending scenarios

  In order to see how Serenity/JS reports a pending Cucumber scenario
  As a curious developer
  I'd like to see an example implementation

  Scenario: A pending scenario

    Here's an example of a pending scenario.
    Should at least one of the steps be marked as pending, the subsequent steps are skipped
    and the entire scenario is marked as pending.
    The same rules apply when a step hasn't been implemented yet - it gets marked as pending too.

    Given a step that passes
      And a step that's marked as pending
      And a step that passes
