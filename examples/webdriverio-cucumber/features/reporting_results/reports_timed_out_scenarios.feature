Feature: Reports timed out scenarios

  In order to see how Serenity/JS reports a timed out Cucumber scenario
  As a curious developer
  I'd like to see an example implementation

  Scenario: A timed out scenario

    Here's an example of a scenario that times out.
    Should at least one of the steps time out, the subsequent steps are skipped and the entire scenario is marked as timed out.

    Given a step that passes
      And a step that times out
      And a step that passes
