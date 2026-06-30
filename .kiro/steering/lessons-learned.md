# Lessons Learned

Project-specific patterns discovered during development that aren't obvious from the code alone.

## Playwright Test retries emit SceneSequenceDetected

When Playwright Test retries a scenario, the adapter emits `SceneSequenceDetected` + `SceneParametersDetected` framing (the same framing used for Cucumber Scenario Outlines). The events share a single `sceneId` and arrive in one queue. Distinguish retries from outlines by checking for `RetryableSceneDetected` in the event stream.

If you're processing `DomainEventQueues` and see `SceneSequenceDetected`, always check whether `RetryableSceneDetected` is also present before assuming it's a Scenario Outline.

## DomainEventQueues merges events by ScenarioDetails, not just sceneId

`DomainEventQueues.queueIdFor()` groups non-`SceneStarts` events by matching `ScenarioDetails` (name + location), not just by `sceneId`. This means events from different sceneIds can end up in the same queue if they share the same scenario identity. This is intentional — it enables retry grouping — but it means a single queue may contain multiple `SceneStarts`/`SceneFinished` pairs.

## Source line numbers are not always available

Not all test runner adapters emit source line numbers (e.g. Protractor/Mocha). When building identifiers from `source.path + ':' + source.line`, always handle the case where `line` is `undefined`. Use the scenario name as a disambiguation fallback.

## The html-reporter has two distinct execution modes

1. **Crew member mode** (`TestRunArchiver` + `HtmlReportGenerator`) — runs during a test, writes artifacts directly to `test-runs/`, reads from the same output directory for aggregation. No `sourceFileSystem` needed.

2. **CLI aggregate mode** — reads `db.json` files from arbitrary external paths, needs a `sourceFileSystem` rooted at their common ancestor to copy artifacts into the output directory. Always pass `sourceFileSystem` in this mode.

## Tree collapse rules in CapabilitiesView

The GitHub-style single-child collapse logic has specific preservation rules:
- **Don't start collapsing** if the node has a `readme` or files (it has content to display)
- **Stop collapsing into** a child that has a `readme` (it has documentation worth showing separately)
- **DO collapse through** children that only have files but no readme (files display fine on the collapsed node)

The asymmetry is intentional: files are content that transfers to the parent when collapsed, but readmes are navigation targets that need their own clickable node.

## Chart.js legend sizing with usePointStyle

`usePointStyle: true` in Chart.js legend config renders legend items using each dataset's `pointRadius` — which is tiny (2-3px) for bar datasets. Use `boxWidth`/`boxHeight` instead for consistent legend item sizing across mixed chart types (bars + lines).

## Artifact types and their rendering

| Artifact | Persisted to disk? | Inlined in data.js? | Rendered as |
|----------|:-:|:-:|---|
| `Photo` (screenshot) | Yes (.png) | No (path reference) | Thumbnail + lightbox |
| `HTTPRequestResponse` | No | Yes (`restQuery`) | Collapsible REST panel |
| `LogEntry` | No | Yes (`reportData[]`) | Pre-formatted text block |
| `TextData` | No | Yes (`reportData[]`) | Pre-formatted text block |
| `JSONData` (generic) | No | Yes (`reportData[]`) | Pre-formatted JSON block |
| Video (.webm) | Yes | No (path reference) | Inline video player |

Binary artifacts (photos, videos) are persisted as files and referenced by path. Structured data artifacts (HTTP exchanges, logs, text) are inlined directly in `db.json`/`data.js` for self-containment.
