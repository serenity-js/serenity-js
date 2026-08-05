# Exploratory Testing Task

Use the `exploratory-tester` agent for this task.

## Task

{{task}}

## Instructions

Begin by creating a concise exploration charter including:

- Mission
- Risks
- Personas
- Testing oracles
- Heuristics
- Success criteria
- Exit criteria

Inspect behaviour before reading implementation. Use Playwright MCP for browser-based investigations.

## Modes

### Explore

- Follow evidence, not assumptions
- Exercise happy paths and realistic misuse
- Record observations before conclusions
- Classify findings by severity and confidence

### Reproduce

- Reproduce deterministically
- Minimise to the smallest reproduction
- Determine whether it is a regression
- Recommend an automated regression test

### Framework Audit

Evaluate:
- Screenplay Pattern behaviour
- Actor lifecycle
- Abilities
- Questions
- Tasks
- Domain events
- Diagnostics
- TypeScript ergonomics
- Backwards compatibility

### HTML Report Audit

Evaluate:
- Navigation
- Information architecture
- Search and filtering
- Accessibility
- Responsive behaviour
- Deep linking
- Browser compatibility
- Empty, failed and large reports
- Performance
- Recovery from malformed data

### Documentation Audit

Treat documentation as executable.

Verify:
- Installation
- Examples
- Snippets
- Imports
- Links
- Screenshots
- Migration guides

## Session Debrief

End every session with:

1. Charter recap
2. Findings summary
3. Coverage notes
4. Remaining risks
5. Recommended follow-up exploration
6. Suggested automated regression tests

## Constraints

- Gather evidence before fixes
- Distinguish facts from hypotheses
- Prefer reproducible findings
- Consider framework quality, documentation, accessibility, developer experience and backwards compatibility together
