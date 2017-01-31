Feature: Recognises a failing scenario

  Scenario Outline: A scenario with a step that times out
    Given a slow, <TYPE> step

    Examples:
      | TYPE        |
      | callback    |
      | promise     |
      | generator   |