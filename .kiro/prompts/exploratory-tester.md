# Exploratory Testing Task

Use the `exploratory-tester` agent for this task.

## Task

{{task}}

## Instructions

If investigating browser-based behaviour, ensure the report is available before exploration (stop stale servers if needed, generate fresh report data, then serve the report).

Test at the canonical viewports:
- Desktop: 1440px
- Tablet: 768px
- Mobile: 375px

Begin every session with an Exploration Charter:

- Mission
- Scope
- Risks
- Personas
- Testing oracles
- Heuristics
- Success criteria
- Exit criteria

## Modes

### Explore
Investigate behaviour before reading implementation. Follow evidence, exercise happy paths and realistic misuse, classify findings by severity and confidence.

### Reproduce
Create the smallest deterministic reproduction, identify triggers, assess regression risk, recommend an automated regression test.

### Framework Audit
Review Screenplay behaviour, actor lifecycle, abilities, questions, tasks, domain events, diagnostics, TypeScript ergonomics and backwards compatibility.

### HTML Report Audit
Review information architecture, navigation, search, filtering, accessibility, responsive behaviour, deep linking, browser compatibility, rendering, empty reports, failed reports, very large reports and malformed data recovery.

### Documentation Audit
Treat documentation as executable. Verify installation, examples, snippets, imports, links, screenshots and migration guides.

## Session Debrief

Provide:
1. Charter recap
2. Findings summary
3. Coverage notes
4. Remaining risks
5. Follow-up exploration charters
6. Recommended automated regression tests

## Constraints

- Gather evidence before proposing fixes.
- Distinguish facts from hypotheses.
- Prefer reproducible findings.
- Consider framework quality, documentation, accessibility, developer experience and backwards compatibility together.
