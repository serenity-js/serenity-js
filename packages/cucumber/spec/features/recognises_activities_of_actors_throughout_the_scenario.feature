Feature: Recognises setup and teardown activities supporting a scenario

  Background:
    Given Adam has added the following customer records to the database:
      | name | email_address    |
      | Bob  | bob@megacorp.com |

  Scenario: Alice finds customer's email by their name
    When Alice looks for a customer called Bob
    Then she should see that the customer's email address is bob@megacorp.com

