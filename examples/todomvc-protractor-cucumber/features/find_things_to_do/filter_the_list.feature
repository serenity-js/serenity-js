Feature: Filter the list to find items of interest

  In order to limit the cognitive load
  As a person with long todo lists
  I want to be able to filter my list to only show items of interest

  Scenario Outline: Viewing <applied filter> items only

    Given that Jane has a todo list containing Write some code, Walk the dog
      And she completes Write some code
     When she filters her list to show only Completed tasks
     Then her todo list should contain Write some code

    Examples:
      | applied filter | expected result |
      | Active         | Walk the dog    |
      | Completed      | Write some code |

  Scenario: Removing the filters to view all the items

    Given that Jane has a todo list containing Write some code, Walk the dog
      And she completes Write some code
     When she filters her list to show only Active tasks
      And she filters her list to show All tasks
     Then her todo list should contain Write some code, Walk the dog
