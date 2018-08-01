Feature: Serenity/JS recognises a scenario with DocStrings

  Scenario: Scenario with a DocString step

    Given a step that receives a doc string:
    """
    Dear customer,

    Please click this link to reset your password.
    """

