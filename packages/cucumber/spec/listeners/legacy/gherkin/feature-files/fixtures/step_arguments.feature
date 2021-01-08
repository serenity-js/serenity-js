Feature: Scenarios with step arguments

  Scenario: The one with a DocString argument

    Given a step with DocString argument:
    """
    A couple of
    lines of
    text
    """

  Scenario: The one with a DataTable argument

    Given a step with a DataTable argument:
    | first name | last name |
    | Jan        | Molak     |
