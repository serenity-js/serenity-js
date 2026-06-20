window.__SERENITY_REPORT_DATA__ = {
  "summary": {
    "title": "Test Project",
    "totalScenarios": 6,
    "outcomes": { "passed": 4, "failed": 1, "pending": 1, "skipped": 0, "compromised": 0, "error": 0 },
    "duration": 5000,
    "startedAt": "2024-06-15T14:30:00.000Z",
    "finishedAt": "2024-06-15T14:30:05.000Z",
    "testRunner": "Playwright"
  },
  "scenarios": [
    {
      "name": "should display items",
      "category": "Todo List",
      "outcome": "SUCCESS",
      "duration": 1200,
      "startedAt": "2024-06-15T14:30:00.000Z",
      "source": { "path": "/project/spec/todo/display.spec.ts", "line": 5 },
      "tags": [{ "type": "feature", "name": "Todo List" }, { "type": "browser", "name": "chromium 120.0" }],
      "activities": [{ "name": "Navigate to /todos", "type": "Interaction", "outcome": "SUCCESS", "duration": 400 }],
      "executionHistory": [
        { "outcome": "SUCCESS", "run": "build 1" },
        { "outcome": "SUCCESS", "run": "build 2" }
      ]
    },
    {
      "name": "should add a new item",
      "category": "Todo List",
      "outcome": "SUCCESS",
      "duration": 1500,
      "startedAt": "2024-06-15T14:30:01.200Z",
      "source": { "path": "/project/spec/todo/display.spec.ts", "line": 15 },
      "tags": [{ "type": "feature", "name": "Todo List" }, { "type": "browser", "name": "chromium 120.0" }],
      "activities": []
    },
    {
      "name": "should complete an item",
      "category": "Todo List",
      "outcome": "FAILURE",
      "duration": 800,
      "startedAt": "2024-06-15T14:30:02.700Z",
      "source": { "path": "/project/spec/todo/complete.spec.ts", "line": 3 },
      "tags": [{ "type": "feature", "name": "Todo List" }, { "type": "browser", "name": "chromium 120.0" }],
      "activities": [],
      "error": { "name": "AssertionError", "message": "Expected item to be checked", "stack": "at Context.<anonymous>" }
    },
    {
      "name": "should persist items",
      "category": "Persistence",
      "outcome": "SUCCESS",
      "duration": 900,
      "startedAt": "2024-06-15T14:30:03.500Z",
      "source": { "path": "/project/spec/persistence.spec.ts", "line": 1 },
      "tags": [{ "type": "feature", "name": "Persistence" }],
      "activities": []
    },
    {
      "name": "should sync across tabs",
      "category": "Persistence",
      "outcome": "PENDING",
      "duration": 12,
      "startedAt": "2024-06-15T14:30:04.400Z",
      "source": { "path": "/project/spec/persistence.spec.ts", "line": 20 },
      "tags": [{ "type": "feature", "name": "Persistence" }],
      "activities": [
        { "name": "Given a step that passes", "type": "Interaction", "outcome": "SUCCESS", "duration": 5, "children": [], "location": { "path": "/project/spec/persistence.spec.ts", "line": 21 } },
        { "name": "And a step that is pending", "type": "Interaction", "outcome": "PENDING", "duration": 1, "children": [], "location": { "path": "/project/spec/persistence.spec.ts", "line": 22 } },
        { "name": "And a step that is skipped", "type": "Interaction", "outcome": "SKIPPED", "duration": 0, "children": [], "location": { "path": "/project/spec/persistence.spec.ts", "line": 23 } }
      ],
      "error": { "name": "ImplementationPendingError", "message": "Step implementation pending", "stack": "ImplementationPendingError: Step implementation pending\n    at Context.<anonymous>" }
    },
    {
      "name": "should greet <Developer>",
      "category": "Greetings",
      "outcome": "SUCCESS",
      "duration": 200,
      "startedAt": "2024-06-15T14:30:04.600Z",
      "source": { "path": "/project/features/greetings.feature", "line": 3 },
      "tags": [{ "type": "feature", "name": "Greetings" }, { "type": "capability", "name": "Reporting" }],
      "activities": [],
      "scenarioOutline": {
        "template": "Given <Developer> is a contributor\nWhen they visit the project\nThen they should see a greeting",
        "parameters": [
          { "name": "contributors", "description": "Some amazing people", "values": { "Developer": "jan-molak" }, "outcome": "SUCCESS", "activities": [{ "name": "Given jan-molak is a contributor", "type": "Interaction", "outcome": "SUCCESS", "duration": 50, "children": [], "location": { "path": "/project/features/greetings.feature", "line": 10 } }] },
          { "name": "contributors", "description": "Some amazing people", "values": { "Developer": "alice" }, "outcome": "SUCCESS", "activities": [{ "name": "Given alice is a contributor", "type": "Interaction", "outcome": "SUCCESS", "duration": 60, "children": [], "location": { "path": "/project/features/greetings.feature", "line": 11 } }] }
        ]
      }
    }
  ],
  "tags": [
    { "type": "feature", "name": "Todo List", "scenarioCount": 3, "passed": 2 },
    { "type": "feature", "name": "Persistence", "scenarioCount": 2, "passed": 1 },
    { "type": "feature", "name": "Greetings", "scenarioCount": 1, "passed": 1 },
    { "type": "capability", "name": "Reporting", "scenarioCount": 1, "passed": 1 },
    { "type": "browser", "name": "chromium 120.0", "scenarioCount": 3, "passed": 2 }
  ],
  "history": [
    { "label": "build 1", "timestamp": "2024-06-14T10:00:00.000Z", "duration": 4500, "outcomes": { "passed": 4, "failed": 0, "pending": 1, "skipped": 0, "compromised": 0 } },
    { "label": "build 2", "timestamp": "2024-06-15T14:30:00.000Z", "duration": 5000, "outcomes": { "passed": 3, "failed": 1, "pending": 1, "skipped": 0, "compromised": 0 } }
  ],
  "flakyTests": [],
  "newFailures": [
    { "name": "should complete an item", "source": { "path": "/project/spec/todo/complete.spec.ts", "line": 3 }, "tags": [] }
  ],
  "newPasses": [
    { "name": "should persist items", "source": { "path": "/project/spec/persistence.spec.ts", "line": 1 }, "tags": [] }
  ],
  "requirements": {
    "type": "directory",
    "name": "spec",
    "outcomes": { "passed": 4, "failed": 1, "pending": 1, "skipped": 0, "compromised": 0, "error": 0 },
    "scenarioCount": 6,
    "readme": "<p>In order to verify our <strong>Todo application</strong> works correctly<br>As a developer<br>I want to run automated tests</p>",
    "children": [
      {
        "type": "directory",
        "name": "todo",
        "outcomes": { "passed": 2, "failed": 1, "pending": 0, "skipped": 0, "compromised": 0, "error": 0 },
        "scenarioCount": 3,
        "children": [
          { "type": "file", "name": "display", "outcomes": { "passed": 2, "failed": 0, "pending": 0, "skipped": 0, "compromised": 0, "error": 0 }, "scenarioCount": 2 },
          { "type": "file", "name": "complete", "outcomes": { "passed": 0, "failed": 1, "pending": 0, "skipped": 0, "compromised": 0, "error": 0 }, "scenarioCount": 1 }
        ]
      },
      { "type": "file", "name": "persistence", "outcomes": { "passed": 1, "failed": 0, "pending": 1, "skipped": 0, "compromised": 0, "error": 0 }, "scenarioCount": 2 },
      { "type": "file", "name": "greetings", "outcomes": { "passed": 1, "failed": 0, "pending": 0, "skipped": 0, "compromised": 0, "error": 0 }, "scenarioCount": 1 }
    ]
  },
  "systemContext": {
    "nodeVersion": "v22.0.0",
    "os": { "name": "macOS", "version": "14.5", "arch": "arm64" },
    "serenityVersion": "3.44.0",
    "testRunner": { "name": "Playwright", "version": "1.60.0" },
    "browsers": [{ "name": "chromium", "version": "120.0" }],
    "ci": {
      "provider": "GitHub Actions",
      "buildNumber": "42",
      "branch": "main",
      "commit": "abc1234",
      "commitMessage": "fix: resolve flaky test",
      "jobUrl": "https://github.com/org/repo/actions/runs/42"
    },
    "projectName": "todo-app",
    "packageManager": "pnpm"
  }
};
