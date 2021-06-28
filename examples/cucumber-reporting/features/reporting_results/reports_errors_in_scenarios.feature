Feature: Reports errors in scenarios

  In order to see how Serenity/JS reports a failing Cucumber scenario
  As a curious developer
  I'd like to see an example implementation

  Scenario: A broken scenario

    Here's an example of a scenario that fails with a generic error.
    Throwing any error will mark the scenario as failed, but generic errors are different
    from say AssertionErrors as they might indicate an issue with the test itself.

    Given a step that fails with a generic error
