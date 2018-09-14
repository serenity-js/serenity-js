Feature: Reports Data Table arguments

  In order to see how Serenity/JS reports a Data Table argument
  As a curious developer
  I'd like to see an example implementation

  Scenario: A Data Table argument

    Steps can be parametrised with a [data table](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/data_table_interface.md).

    Given a step that receives a table:
      | Developer | Website      |
      | Jan Molak | janmolak.com |
