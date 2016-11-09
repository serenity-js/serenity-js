Feature: Filter the list to find items of interest

  In order to focus on things that matter
  James would like to filter his todo list   
  to only show items of interest

  Scenario Outline: Viewing <applied filter> items only

    Given that James has a todo list containing Write some code, Walk the dog
      And he completes Write some code
     When he filters his list to show only <applied filter> tasks
     Then his todo list should contain <expected result>

    Examples:
      | applied filter | expected result |
      | Active         | Walk the dog    |
      | Completed      | Write some code |

  Scenario: Removing the filters to view all the items

    Given that James has a todo list containing Write some code, Walk the dog
      And he completes Write some code
     When he filters his list to show only Active tasks
      And he filters his list to show All tasks
     Then his todo list should contain Write some code, Walk the dog
