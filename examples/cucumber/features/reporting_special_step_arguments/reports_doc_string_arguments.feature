Feature: Reports DocString arguments

  In order to see how Serenity/JS reports a DocString argument
  As a curious developer
  I'd like to see an example implementation

  Scenario: A DocString argument

    If you need to specify information in a scenario that won't fit on a single line,
    you can use a [DocString](https://relishapp.com/cucumber/cucumber/docs/gherkin/doc-strings).
    A [DocString](https://relishapp.com/cucumber/cucumber/docs/gherkin/doc-strings) follows a step,
    and starts and ends with three double quotes, like this:

    Given a step that receives a doc string:
    """
    Dear customer,

    Please click this link to reset your password.
    """
