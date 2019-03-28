Feature: Basic arithmetic operations

  Background:
    Given Dominique has requested a new calculation

  Scenario: Addition

    When Dominique enters 2
     And she uses the + operator
     And she enters 3
    Then she should get a result of 5

  Scenario: Subtraction

    When Dominique enters 4
     And she uses the - operator
     And she enters 3
    Then she should get a result of 1

  Scenario: Multiplication

    When Dominique enters 2
     And she uses the * operator
     And she enters 8
    Then she should get a result of 16

  Scenario: Division

    When Dominique enters 10
     And she uses the / operator
     And she enters 2
    Then she should get a result of 5
