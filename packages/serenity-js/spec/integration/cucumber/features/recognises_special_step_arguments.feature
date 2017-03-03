Feature: Recognises special step arguments

  # https://github.com/cucumber/cucumber-js/blob/b659dc887ee8e94149b2148e83857b6c653aa2fa/features/data_tables.feature
  @datatable
  Scenario: Reports a data table argument

    Given the following accounts:
      | name | email                  | twitter   |
      | Jan  | jan.molak@serenity.io  | @JanMolak |
      | John | john.smart@serenity.io | @wakaleo  |

  @docstring
  Scenario: Reports a DocString argument

    Given an example.ts file with the following contents:
      """
      export const noop = (_) => _;
      export const sum  = (a, b) => a + b;
      """