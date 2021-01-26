@feature-tag
Feature: Serenity/JS recognises tags at multiple levels

  @scenario-tag
  Scenario: A tagged scenario

    Given a step that passes

  @scenario-outline-tag
  Scenario Outline: More tagged scenarios

    Given a step that <result>

    @example-set-1
    Examples:
    | result |
    | passes |

    @example-set-2
    Examples:
      | result |
      | passes |