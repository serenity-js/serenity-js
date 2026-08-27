# Error message search with special characters

## Problem

When navigating from the Errors view to the Test Scenarios view by clicking on an error message,
the error text is passed as a `search` query parameter. If the error message contains double quotes
(e.g., `Expected <<persisted items>>[0] to have property title that does equal "buy some cheese"`),
the resulting URL contains unescaped quotes inside the search parameter value:

```
#/tests?search="Expected <<persisted items>>..."
```

This causes the search filter to match zero scenarios because the search parser treats the outer
quotes as part of the search term boundary rather than literal characters to match against.

## Expected Behaviour

The search should find and display the scenarios whose error messages contain the quoted text.
Either:
- The quotes should be properly escaped/handled when constructing the search URL, or
- The search parser should treat the full parameter value (including quotes) as a literal search term

## Reproduction

1. Run the `playwright-test-todomvc` example with intentional persistence failures
2. Open the HTML report at `http://localhost:8080`
3. Navigate to the Errors view (`#/errors`)
4. Click on an assertion error that contains double quotes in its message
5. Observe that the Scenarios view shows 0 results instead of the matching scenarios

## Affected URL pattern

```
#/tests?search=%22Expected+%3C%3Cpersisted+items%3E%3E%5B0%5D+to+have+property+title+that+does+equal+%22buy+some+cheese%22...%22
```

The `%22` (encoded `"`) characters at the start and end of the search value cause the issue.
