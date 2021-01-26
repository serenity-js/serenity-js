Feature: Scenario outlines

  Scenario Outline: The one with examples

  Description of the scenario with examples

    Given step with a <parameter>

    Examples: Name of the example set

    Description of the example set

      | parameter |
      | value one |
      | value two |

  Scenario Outline: The one with more examples

  Description of the scenario with more examples

    Given step with a <parameter>

    Examples: Name of the first set of examples

    Description of the first set of examples

      | parameter |
      | value one |
      | value two |

    Examples: Name of the second set of examples

    Description of the second set of examples

      | parameter   |
      | value three |
      | value four  |

  Scenario Outline: The one with parametrised step argument (DocString)

    Given step with a:
    """
    Parameter of <parameter>
    """

    Examples:

      | parameter |
      | value one |

  Scenario Outline: The one with parametrised step argument (DataTable)

    Given the user logs in as <username> with the following credentials:
      | username | <username> |
      | password | <password> |

    Examples:

      | username | password  |
      | admin    | P@ssw0rd1 |
      | editor   | P@ssw0rd2 |