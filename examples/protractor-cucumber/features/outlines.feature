Feature: Outlines

  Scenario Outline: Actor interacts with a website

    When Umbra navigates to the test website number <id>
    Then she should see the title of "Test Website number <id>"

  Examples:
    | id |
    | 1  |
    | 2  |
    | 3  |
    | 4  |
