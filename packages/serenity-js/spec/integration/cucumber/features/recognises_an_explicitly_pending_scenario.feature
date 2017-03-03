Feature: Recognises explicitly pending scenarios

  Scenario: An explicitly pending synchronous scenario
    Given a pending step with a synchronous interface

  Scenario: An explicitly pending callback scenario
    Given a pending step with a callback interface

  Scenario: An explicitly pending promise scenario
    Given a pending step with a promise interface

  Scenario: An explicitly pending generator scenario
    Given a pending step with a generator interface
