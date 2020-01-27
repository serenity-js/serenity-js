Feature: Calculations API

  Scenario Outline: Calculates result of basic expressions

    When Apisitt asks for the following calculation: <expression>
    Then he should get a result of <expected_result>

    Examples: Basic expressions

      | expression | expected_result | description    |
      | 2          | 2               | Literal        |
      | 2 + 2      | 4               | Addition       |
      | 2 - 3      | -1              | Subtraction    |
      | 2 * 5      | 10              | Multiplication |
      | 5 / 2      | 2.5             | Division       |

  Scenario: Recognises order of operations

    When Apisitt asks for the following calculation: 2 + 2 * 2
    Then he should get a result of 6
