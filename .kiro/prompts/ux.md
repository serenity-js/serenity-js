# UX Task

Use the `ux` agent for this task.

## Task

{{task}}

## Instructions

Inspect the current state before changing anything. Use Playwright MCP to view the running report at the URL provided (or http://localhost:8080 by default). Test at mobile (375px), tablet (768px), and desktop (1440px) viewports where relevant.

### Mode: Review

If the task asks you to review, audit, or evaluate:
- Ground every finding in observed behaviour (screenshot or describe what you see)
- Classify findings by severity (Critical / High / Medium / Low)
- For each finding: what's wrong → who it affects → what to do about it
- Prioritise by user impact against the north star metrics

### Mode: Fix

If the task asks you to fix a specific problem:
- Reproduce the issue first (confirm you can see it)
- Identify root cause in the source
- Fix within existing design system constraints
- Compile, verify visually, run tests
- Commit with conventional format

### Mode: Create

If the task asks you to design or create new functionality:
- Confirm the user has approved adding new UI surface area (stabilisation constraint)
- Generate 2–4 genuinely different concepts (not minor variations)
- For each: describe the approach, its strengths, its weaknesses
- Evaluate against: responsive behaviour, accessibility, cognitive load, design system consistency
- Recommend one with clear reasoning
- Wait for approval before implementing

## Constraints

- Stay within the established design system (see `html-reporter-ux.md` in agent resources)
- No new UI elements without explicit user approval (stabilisation)
- Every change must compile cleanly and pass tests
- Prefer solutions that improve both usability and testability
