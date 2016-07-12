# Features

[x] screenshots in reports
[ ] configurable output directories
    [ ] make the default behaviour of when to capture screenshots configurable
[ ] requirements structure      java -jar serenity-cli-0.0.1-SNAPSHOT-all.jar -features acceptance/features
[ ] report assertion failures with stack traces
[ ] detect types of failure (compromised, assertion, etc)
[-] screenshot resizing -> do it in the CLI
[ ] demonstrate support for multiple browsers in one test - https://github.com/angular/protractor/blob/master/docs/browser-setup.md#using-multiple-browsers-in-the-same-test

# Architecture

[ ] Cucumber - automatically wrap g/w/t in Control Flow
    [ ] Are all those promises even needed then?
[x] extract step interpolation
[x] File System abstraction
[ ] Targets, helper classes
[ ] Dependency Injection container of some sort?
[ ] Step usage plugin (based on event sourcing)

# Bugs:

[ ] CLI doesn't show the screenshots unless they're on every single step