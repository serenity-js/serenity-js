Feature: Reports compromised scenarios

  In order to see how Serenity/JS reports a compromised Cucumber scenario
  As a curious developer
  I'd like to see an example implementation

  Scenario: A compromised scenario

    Here's an example of a compromised scenario.
    A compromised scenario is one that has failed due to issues external to the system.
    For example, if the firewall is blocked we can't test a REST API.

    Given a step that fails with an error compromising the test
