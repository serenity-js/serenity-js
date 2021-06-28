Feature: Reports failing scenarios

  In order to see how Serenity/JS reports a failing Cucumber scenario
  As a curious developer
  I'd like to see an example implementation

  Scenario: A scenario failing with a Serenity/JS AssertionError

    Here's an example of a scenario failing due to an assertion error.
    The rule here is simple: provided that one of the steps fail the scenario fails as well.

    Given a step that passes
      And a step that fails with a Serenity/JS AssertionError

  Scenario: A scenario failing with a Node.js AssertionError

    Did you know thatSerenity/JS picks up generic AssertionErrors too?

    Given a step that passes
      And a step that fails with a Node.js AssertionError
