# Requirements Document

## Introduction

The `@serenity-js/html-reporter` module is a pure static HTML reporter for Serenity/JS that replaces the Java-based Serenity BDD CLI. The module ships with the HTML report template and all required JavaScript libraries (Preact, Chart.js, @tanstack/virtual-core, etc.) as npm dependencies. Upon completion of a test run, it produces a self-contained report under a configurable output directory (default: `./reports/serenity-js`). The generated `index.html` inlines all CSS, JavaScript, and library code so that the report functions in air-gapped corporate environments with no external network requests — only user-generated artifacts (screenshots, videos, traces) are loaded as separate files. Each test run produces its own `db.json` file and associated artifacts under a timestamped subdirectory (`test-runs/<timestamp>/`). Historical test run data files are preserved between runs, enabling trend analysis and execution history. The report works on `file://` protocol, GitHub Pages, GitLab Pages, S3, and any static hosting without a backend or fetch API.

**Visual Design Reference:** The report UI should follow the clean, card-based dashboard style of the Materio Vuetify admin template: https://demos.themeselection.com/materio-vuetify-nuxtjs-admin-template-free/demo/dashboard — using a similar approach to layout, spacing, card elevation, typography, and colour palette for both light and dark modes.

## Glossary

- **HTML_Reporter**: The `@serenity-js/html-reporter` StageCrewMember that collects domain events, stores per-run data and artifacts, and produces the static HTML report
- **Report_Output**: The output directory containing the generated report (default: `./reports/serenity-js`). Contains `index.html`, `data.js`, and the `test-runs/` subdirectory
- **Test_Run_Directory**: A timestamped subdirectory under `test-runs/` (e.g. `test-runs/2024-06-15T14:30:00.000Z/`) containing the `db.json` data file and any artifacts (screenshots, videos, traces) produced during that test run
- **Run_Data_File**: The `db.json` file within a Test_Run_Directory, containing the complete test execution data for a single test run. Preserved between runs to enable trend analysis
- **Data_Snapshot**: The `data.js` file at the Report_Output root, regenerated on each test run by aggregating all Run_Data_Files. Assigned to `window.__SERENITY_REPORT_DATA__` for consumption by the Report_Template
- **Report_Template**: The static HTML/CSS/JS template that renders the report from the global data variable
- **Scene**: A single test scenario (e.g. a Playwright Test `test()`, a Cucumber scenario, a Mocha `it()`)
- **Activity_Tree**: The hierarchical tree of Tasks, Interactions, and their outcomes within a Scene
- **Domain_Event**: An event emitted by Serenity/JS core during a test run (SceneStarts, InteractionFinished, etc.)
- **Stage**: The Serenity/JS messaging infrastructure that distributes Domain_Events to StageCrewMembers
- **StageCrewMember**: An interface for in-memory services that react to Domain_Events published by the Stage
- **StageCrewMemberBuilder**: A factory interface for creating complex StageCrewMembers with injected dependencies
- **Artifact**: A file-based output produced during a test run (screenshot, video, trace file, log) stored within the Test_Run_Directory
- **Tag**: A metadata label attached to a Scene (e.g. feature name, issue reference, capability)
- **Requirements_Hierarchy**: A tree structure that mirrors the user's directory layout under the Spec_Directory, with no predefined semantic meaning per nesting level — directories are simply navigable grouping nodes and test files can appear at any depth
- **Spec_Directory**: The configurable root directory from which the Requirements_Hierarchy is derived
- **Test_Run**: A complete execution of the test suite, producing one Run_Data_File and associated artifacts in a new Test_Run_Directory
- **Trend_Data**: Historical test run summaries derived by aggregating Run_Data_Files across successive test runs
- **Unstable_Test**: A test whose most recent executions (within the Stability_Window) include both passes and failures, indicating non-deterministic behaviour
- **Regressed_Test**: A test whose previous execution was a pass but whose current (most recent) execution is a failure
- **Recovered_Test**: A test whose previous execution was a failure but whose current (most recent) execution is a pass
- **Stability_Window**: The number of most recent test run executions considered when evaluating test stability (configurable, default: 5)

## Requirements

### Requirement 1: StageCrewMember Integration

**User Story:** As an Engineer, I want the HTML Reporter to integrate as a standard StageCrewMember, so that I can configure it using the same crew pattern as other reporters.

#### Acceptance Criteria

1. THE HTML_Reporter SHALL implement the StageCrewMember interface from `@serenity-js/core`
2. THE HTML_Reporter SHALL provide a static `fromJSON` factory method that returns a StageCrewMemberBuilder
3. WHEN the HTML_Reporter is assigned to a Stage, THE HTML_Reporter SHALL begin collecting Domain_Events
4. THE HTML_Reporter SHALL support configuration via the crew array in test runner configuration (Playwright Test, WebdriverIO, Cucumber, Mocha, Jasmine)
5. THE HTML_Reporter SHALL accept an `outputDirectory` configuration option specifying the Report_Output path
6. THE HTML_Reporter SHALL default the `outputDirectory` to `./reports/serenity-js` when no configuration is provided
7. THE HTML_Reporter SHALL accept a `specDirectory` configuration option for deriving the Requirements_Hierarchy
8. THE HTML_Reporter SHALL work alongside other StageCrewMembers without interfering with their operation

### Requirement 2: Domain Event Collection

**User Story:** As an Engineer, I want the HTML Reporter to collect all relevant domain events during a test run, so that the report contains complete test execution data.

#### Acceptance Criteria

1. WHEN a SceneStarts event is received, THE HTML_Reporter SHALL create a new Scene record to accumulate subsequent events
2. WHEN an ActivityStarts or ActivityFinished event is received, THE HTML_Reporter SHALL add the activity to the current Scene's Activity_Tree
3. WHEN an InteractionStarts or InteractionFinished event is received, THE HTML_Reporter SHALL record the interaction with its outcome and duration
4. WHEN a SceneTagged event is received, THE HTML_Reporter SHALL associate the Tag with the current Scene
5. WHEN a SceneFinished event is received, THE HTML_Reporter SHALL finalise the Scene record with its overall outcome
6. WHEN an ActivityRelatedArtifactGenerated event is received, THE HTML_Reporter SHALL associate the Artifact reference with the corresponding activity
7. WHEN a TestRunnerDetected event is received, THE HTML_Reporter SHALL record the test runner name for the current Scene
8. WHEN parallel Scenes execute concurrently, THE HTML_Reporter SHALL correctly associate events with their respective Scenes using correlation IDs

### Requirement 3: Report Generation

**User Story:** As an Engineer, I want the HTML Reporter to produce the complete report at the end of a test run, so that I can view results immediately after tests complete.

#### Acceptance Criteria

1. WHEN a TestRunFinishes event is received, THE HTML_Reporter SHALL create a new Test_Run_Directory named with an ISO 8601 timestamp (e.g. `test-runs/2024-06-15T14:30:00.000Z/`)
2. THE HTML_Reporter SHALL write the Run_Data_File (`db.json`) containing the complete test execution data for the current run into the Test_Run_Directory
3. THE HTML_Reporter SHALL store any Artifacts (screenshots, videos, traces) produced during the test run into the same Test_Run_Directory
4. AFTER writing the Run_Data_File, THE HTML_Reporter SHALL aggregate all existing Run_Data_Files from `test-runs/*/db.json` to produce the Data_Snapshot (`data.js`) at the Report_Output root
5. THE HTML_Reporter SHALL write the `index.html` file to the Report_Output root by inlining all JavaScript libraries from npm dependencies and all CSS into the template
6. IF the `index.html` file already exists in the Report_Output directory, THEN THE HTML_Reporter SHALL overwrite it with the latest version
7. THE HTML_Reporter SHALL emit an AsyncOperationAttempted event before report generation begins
8. THE HTML_Reporter SHALL emit an AsyncOperationCompleted event when report generation succeeds
9. IF report generation fails, THEN THE HTML_Reporter SHALL emit an AsyncOperationFailed event with the error details
10. THE HTML_Reporter SHALL complete report generation within 10 seconds for a test suite of up to 1000 Scenes
11. THE HTML_Reporter SHALL produce valid UTF-8 encoded output files supporting international characters
12. SINCE the reporter process is single-process, THE HTML_Reporter MAY assume that the data produced for a given test run is atomic and wholly produced by itself (no concurrent writers to the same Test_Run_Directory)
13. THE HTML_Reporter SHALL NOT modify or delete any existing Test_Run_Directories or their contents — only `index.html` and `data.js` at the Report_Output root are regenerated on each run
14. ONLY WHEN the user has explicitly configured a `maxHistory` limit SHALL the HTML_Reporter remove older Test_Run_Directories that exceed that limit

### Requirement 4: Data File Format

**User Story:** As an Engineer, I want the data file to use a global variable assignment pattern, so that the report works on file:// protocol without fetch or CORS issues.

#### Acceptance Criteria

1. THE Data_Snapshot SHALL assign test results to `window.__SERENITY_REPORT_DATA__` as a JavaScript object literal
2. THE Data_Snapshot SHALL contain a `summary` property with pass, fail, pending, skipped, and compromised counts for the latest test run
3. THE Data_Snapshot SHALL contain a `scenes` array with one entry per Scene from the latest test run, including name, outcome, duration, startedAt timestamp, tags, and Activity_Tree
4. THE Data_Snapshot SHALL contain a `tags` array listing all unique Tags with their associated Scene counts
5. THE Data_Snapshot SHALL contain a `requirements` property representing the Requirements_Hierarchy tree
6. THE Data_Snapshot SHALL escape special characters in string values to produce valid JavaScript
7. THE Data_Snapshot SHALL include artifact references (screenshot paths, video paths) as relative URLs from the Report_Output directory (e.g. `test-runs/2024-06-15T14:30:00.000Z/screenshot-001.png`)
8. WHEN the `data.js` file is included via a `<script>` tag, THE Data_Snapshot SHALL be parseable by any standard JavaScript engine without errors

#### Run Data File Format

9. THE Run_Data_File (`db.json`) SHALL be a valid JSON file containing the complete test execution data for a single test run
10. THE Run_Data_File SHALL contain: timestamp, duration, outcome counts, scenes array (each with startedAt timestamp), tags, test runner metadata, and system context
11. THE Run_Data_File SHALL include artifact references as relative paths from the Test_Run_Directory (e.g. `screenshot-001.png`)
12. THE Run_Data_File SHALL be independently parseable and self-contained (no references to external state)

### Requirement 5: Data File Serialisation

**User Story:** As a developer, I want to ensure the data serialisation is correct and lossless, so that the report accurately represents test execution results.

#### Acceptance Criteria

1. THE HTML_Reporter SHALL produce a Run_Data_File that, when parsed as JSON, produces an object structurally equivalent to the in-memory representation
2. FOR ALL Scene records collected during a test run, serialising to the Run_Data_File and parsing the result SHALL produce objects with the same property values (round-trip property)
3. THE HTML_Reporter SHALL serialise Duration values as numeric milliseconds
4. THE HTML_Reporter SHALL serialise Timestamp values as ISO 8601 strings
5. THE HTML_Reporter SHALL serialise Outcome values as string identifiers (e.g. "SUCCESS", "FAILURE", "PENDING", "SKIPPED", "COMPROMISED", "ERROR")
6. THE HTML_Reporter SHALL serialise the Activity_Tree as nested arrays preserving parent-child relationships
7. THE Data_Snapshot aggregation SHALL correctly merge scene execution histories from multiple Run_Data_Files, ordered chronologically

### Requirement 6: Static Report Template

**User Story:** As an Engineer working in an air-gapped corporate environment, I want the report to be a fully self-contained static website with no external dependencies, so that I can open it on file:// protocol or serve it from any host without internet access.

#### Acceptance Criteria

1. THE Report_Template SHALL load test data exclusively from the `window.__SERENITY_REPORT_DATA__` global variable set by the `data.js` script
2. THE Report_Output SHALL contain at minimum: `index.html`, `data.js`, and a `test-runs/` directory with one or more timestamped subdirectories
3. THE `index.html` file SHALL include the `data.js` file via a `<script src="./data.js"></script>` tag
4. THE Report_Template SHALL render correctly when opened via `file://` protocol in a modern browser
5. THE Report_Template SHALL render correctly when served from any static hosting (GitHub Pages, GitLab Pages, S3)
6. THE Report_Template SHALL make no external network requests whatsoever — no CDN links, no fetch calls, no WebSocket connections, no external font loading
7. THE `index.html` SHALL inline all JavaScript libraries (Preact, Chart.js, chartjs-plugin-zoom, @tanstack/virtual-core, HTM, etc.) directly within `<script>` tags
8. THE `index.html` SHALL inline all CSS within `<style>` tags (no external stylesheets or font imports)
9. THE only external file references in `index.html` SHALL be `data.js` and user-generated artifacts (screenshots, videos, traces) within `test-runs/` subdirectories
10. THE Report_Output directory structure SHALL be self-contained and relocatable (all internal references use relative paths)

#### Design Notes — Module Packaging

- THE `@serenity-js/html-reporter` npm package SHALL declare all client-side libraries (Preact, Chart.js, chartjs-plugin-zoom, @tanstack/virtual-core, HTM) as npm dependencies
- THE module SHALL ship with a report template (source form) that references these libraries
- AT report generation time, THE HTML_Reporter SHALL produce the final `index.html` by inlining all library code from the installed npm dependencies into the template
- THIS approach ensures libraries are versioned, updatable via standard npm mechanisms, and auditable for security — while the output remains fully offline-capable
- THE template source MAY use CDN imports during development (for fast iteration in a browser), but the production output generated by the reporter MUST inline everything

### Requirement 7: Summary Dashboard View

**User Story:** As a Product Owner, I want an overview dashboard showing test results at a glance, so that I can quickly assess the stability of the system under test.

#### Acceptance Criteria

1. THE Report_Template SHALL display the total count of Scenes grouped by outcome (passed, failed, pending, skipped, compromised, errored)
2. THE Report_Template SHALL display the overall pass rate as a percentage
3. THE Report_Template SHALL display the total test run duration
4. THE Report_Template SHALL display a visual breakdown of outcomes (chart or progress bar)
5. THE Report_Template SHALL display the timestamp of when the test run completed
6. THE Report_Template SHALL display the test runner name used for the run

### Requirement 8: Scene Detail View

**User Story:** As an Engineer, I want to see detailed information about each test scenario, so that I can analyse failures and debug issues.

#### Acceptance Criteria

1. WHEN a Scene is selected, THE Report_Template SHALL display the Scene name and its outcome
2. WHEN a Scene is selected, THE Report_Template SHALL display the complete Activity_Tree showing Tasks and Interactions in hierarchical order
3. WHEN a Scene is selected, THE Report_Template SHALL display the duration of each activity in the tree
4. WHEN a Scene is selected, THE Report_Template SHALL display the outcome of each activity (passed, failed, skipped)
5. WHEN a Scene has associated screenshots, THE Report_Template SHALL display thumbnails linked to full-size images at the corresponding activity step
6. WHEN a Scene has failed, THE Report_Template SHALL display the error message and stack trace
7. WHEN a Scene has Tags, THE Report_Template SHALL display the Tags as clickable labels
8. WHEN a Scene involved one or more Actors, THE Report_Template SHALL display the cast — listing each Actor's name and their Abilities (e.g. BrowseTheWeb, CallAnApi, TakeNotes)

#### Design Notes — Source Code Permalinks in Activity Tree

- **Opportunity:** Serenity/JS already tracks the source location (file path + line number) where each activity (Task, Interaction) was instantiated. If we also know the VCS provider (GitHub, GitLab, Bitbucket), the commit hash, and the project/repository name, we can generate permalinks from each activity in the tree directly to the corresponding source line.
- **Example permalink formats:**
  - GitHub: `https://github.com/{org}/{repo}/blob/{commit}/{filePath}#L{line}`
  - GitLab: `https://gitlab.com/{org}/{repo}/-/blob/{commit}/{filePath}#L{line}`
  - Bitbucket: `https://bitbucket.org/{org}/{repo}/src/{commit}/{filePath}#lines-{line}`
- **Required data:**
  - VCS provider (detect from CI env vars or accept as configuration)
  - Repository URL or `{org}/{repo}` (detect from `GITHUB_REPOSITORY`, `CI_PROJECT_PATH`, or parse from the `repository` field in the project's `package.json`)
  - Commit hash (detect from `GITHUB_SHA`, `CI_COMMIT_SHA`, `GIT_COMMIT`, or read from `.git/HEAD`)
  - Source file path + line per activity (already available in Serenity/JS reporting)
- **Auto-detection from package.json:** The `repository` field in `package.json` (e.g. `{ "type": "git", "url": "https://github.com/org/repo.git" }` or shorthand `"org/repo"`) can be parsed to determine the VCS provider and repository path without requiring explicit configuration.
- **Configuration option:** `sourceCodeUrl` pattern, e.g. `https://github.com/org/repo/blob/{commit}/{path}#L{line}`
- **Template rendering:** Each activity name in the tree would become a clickable link (opening in a new tab) when source location + VCS config is available. When not configured, activities render as plain text (current behaviour).
- **Priority:** Address after the initial HTML reporter implementation is stable.

### Requirement 9: Tag-Based Filtering

**User Story:** As a Product Owner, I want to filter test results by tags, so that I can focus on specific subsets of my test suite.

#### Acceptance Criteria

1. THE Report_Template SHALL display a list of all available Tags with their Scene counts
2. WHEN a Tag is selected, THE Report_Template SHALL filter the Scene list to show only Scenes with that Tag
3. WHEN multiple Tags are selected, THE Report_Template SHALL show Scenes matching any of the selected Tags
4. THE Report_Template SHALL update the URL hash to reflect the current filter state for bookmarking
5. WHEN the report is loaded with a filter hash in the URL, THE Report_Template SHALL apply the corresponding filter

### Requirement 10: Dark and Light Mode

**User Story:** As an Engineer, I want the report to support dark and light colour themes, so that I can read it comfortably in any environment.

#### Acceptance Criteria

1. THE Report_Template SHALL detect the operating system colour preference via `prefers-color-scheme` media query
2. THE Report_Template SHALL apply the matching theme (dark or light) on initial load
3. THE Report_Template SHALL provide a visible toggle control to switch between dark and light mode
4. WHEN the user toggles the theme, THE Report_Template SHALL persist the preference in `localStorage`
5. WHEN the report is reloaded, THE Report_Template SHALL restore the previously selected theme from `localStorage`

### Requirement 11: Media Attachments

**User Story:** As an Engineer, I want to see screenshots, videos, and trace files captured during test execution, so that I can visually debug failures and understand what happened at each step.

#### Acceptance Criteria

1. WHEN a Scene step has an associated screenshot artifact, THE Report_Template SHALL display a thumbnail preview at the corresponding Activity_Tree node
2. WHEN a thumbnail is clicked, THE Report_Template SHALL display the full-size screenshot in a lightbox overlay
3. WHEN a Scene has an associated video recording, THE Report_Template SHALL display an inline video player in the Scene Detail View
4. WHEN a Scene has an associated Playwright trace file, THE Report_Template SHALL display a download link and/or a link to open the trace in trace.playwright.dev
5. THE Report_Template SHALL reference media files using relative paths from the Report_Output directory (e.g. `test-runs/2024-06-15T14:30:00.000Z/screenshot-001.png`)
6. THE HTML_Reporter SHALL write artifact files directly into the Test_Run_Directory during the test run, without relying on ArtifactArchiver or any external archiving mechanism
7. WHEN an ActivityRelatedArtifactGenerated event is received, THE HTML_Reporter SHALL persist the artifact to the Test_Run_Directory and record its relative path in the Run_Data_File
8. THE Report_Template SHALL display a placeholder when a referenced media file is missing
9. WHEN a Scene has associated log attachments (browser logs, stdout/stderr, server logs, or other textual data), THE Report_Template SHALL display them as expandable text blocks within the Scene Detail View
10. THE Report_Template SHALL support the following attachment types: screenshots (per step), video recordings (per test), Playwright trace files (per test), and text logs (per test or per step)
11. SINCE tests within a test run can execute in parallel, THE HTML_Reporter SHALL use unique filenames for artifacts (e.g. `screenshot-<correlationId>-<sequence>.png`) to avoid collisions

### Requirement 12: Requirements Hierarchy View

**User Story:** As a Product Owner or Engineer, I want to browse test results organised by requirements hierarchy, so that I can understand quality coverage of specific product areas, identify parts of the system with the least coverage, and read the living documentation.

#### Acceptance Criteria

1. THE Report_Template SHALL display the Requirements_Hierarchy as a navigable tree
2. WHEN a hierarchy node is selected, THE Report_Template SHALL display aggregate pass/fail counts for all Scenes within that node
3. THE HTML_Reporter SHALL derive the Requirements_Hierarchy by mirroring the directory structure under the configured Spec_Directory, where each subdirectory becomes a tree node and each test file becomes a leaf
4. THE Requirements_Hierarchy SHALL assign no semantic meaning to nesting levels (no fixed "capability" or "feature" labels per depth) — directories are simply navigable grouping nodes and test files can appear at any depth
5. WHEN a README.md file exists at a hierarchy level, THE HTML_Reporter SHALL include its content as documentation for that node

### Requirement 13: Trend and History

**User Story:** As a Product Owner, I want to see test result trends across multiple runs, so that I can detect regressions and assess whether the system is becoming more stable over time.

#### Acceptance Criteria

1. WHEN producing the Data_Snapshot, THE HTML_Reporter SHALL read all existing Run_Data_Files from `test-runs/*/db.json` to construct historical Trend_Data
2. THE Data_Snapshot SHALL contain a `history` array with summary results from all available Test_Runs (timestamp, outcome counts, duration, optional build label, optional CI job URL)
3. THE HTML_Reporter SHALL order the `history` array chronologically (oldest first) based on Test_Run_Directory timestamps
4. THE Report_Template SHALL display trend data as a line or bar chart showing outcome counts per historical run
5. WHERE a maximum history limit is configured, THE HTML_Reporter SHALL retain only the most recent N Test_Run_Directories (deleting older directories and their artifacts)
6. THE HTML_Reporter SHALL derive execution history for individual Scenes by correlating scene identifiers across Run_Data_Files (matching by source file path + line number)
7. Run_Data_Files SHALL be preserved between test runs to enable trend analysis — they are the source of truth for history, not the Data_Snapshot

### Requirement 14: Error Analysis View

**User Story:** As an Engineer, I want a dedicated error report showing all errors that occurred during the test run sorted by impact, so that I can quickly identify systemic issues (e.g. a broken login selector affecting dozens of tests, or a database connection error reported by an API healthcheck) and distinguish high-impact root causes from isolated failures.

#### Acceptance Criteria

1. THE Report_Template SHALL display a dedicated error analysis view listing all distinct errors that occurred during the test run
2. THE Report_Template SHALL group errors by their message (or a normalised form of their message) and display the count of affected Scenes per error
3. THE Report_Template SHALL sort error groups by the number of affected Scenes in descending order (most impactful errors first)
4. WHEN an error group is selected, THE Report_Template SHALL list all Scenes affected by that error with links to their detail views
5. THE Report_Template SHALL display the error type/class name, the error message, and an example stack trace for each error group
6. THE Report_Template SHALL visually distinguish errors that affected a large proportion of the test run (e.g. >50% of failed Scenes) as potential root causes
7. THE Report_Template SHALL use virtual scrolling (rendering only visible items) for the error list, consistent with the approach defined in Requirement 31
8. WHEN errors are grouped by type category, THE Report_Template SHALL display sticky category headers that remain pinned to the top of the scroll container while the user scrolls within a group, consistent with the approach defined in Requirement 33

### Requirement 15: Stability View

**User Story:** As an Engineer or Product Owner, I want a dedicated stability view showing tests with non-deterministic outcomes, so that I can prioritise fixing unreliable tests and assess which parts of the system are least trustworthy.

#### Acceptance Criteria

1. THE Report_Template SHALL provide a dedicated "Stability" view accessible from the main navigation
2. THE HTML_Reporter SHALL determine test stability based on the Stability_Window (configurable, default: 5 most recent executions)
3. WHILE Trend_Data from multiple Test_Runs is available, THE Report_Template SHALL identify Unstable_Tests — Scenes that have both passed and failed within the Stability_Window
4. THE Report_Template SHALL list all identified Unstable_Tests sorted by instability rate (highest first)
5. THE Report_Template SHALL display the pass/fail ratio for each Unstable_Test across the Stability_Window
6. THE Report_Template SHALL group unstable tests by their location in the Requirements_Hierarchy (when available) so users can identify which areas of the system are most unstable
7. WHEN an Unstable_Test entry is selected, THE Report_Template SHALL navigate to the Scene Detail View for that test
8. THE Report_Template SHALL classify tests as "regressed" (Regressed_Test: previous execution passed, current failed) or "recovered" (Recovered_Test: previous execution failed, current passed) based on the two most recent run outcomes
9. THE Report_Template SHALL display explanatory text or tooltips defining "unstable", "regressed", and "recovered" so users understand the terminology

### Requirement 16: Timeline View

**User Story:** As an Engineer, I want a timeline showing parallel test execution, so that I can understand concurrency and find performance bottlenecks.

#### Acceptance Criteria

1. THE Report_Template SHALL display Scenes on a horizontal timeline showing their start time and duration
2. THE Report_Template SHALL display parallel Scenes on separate swim lanes
3. WHEN a Scene on the timeline is clicked, THE Report_Template SHALL navigate to the Scene Detail View

### Requirement 17: Client-Side Search

**User Story:** As an Engineer, I want to search through test results, so that I can quickly find specific scenarios.

#### Acceptance Criteria

1. THE Report_Template SHALL provide a text input for searching Scene names
2. WHEN a search query is entered, THE Report_Template SHALL filter displayed Scenes to those whose name contains the query (case-insensitive)
3. THE Report_Template SHALL perform search filtering client-side without network requests
4. THE Report_Template SHALL display the number of matching results

### Requirement 18: Responsive Design

**User Story:** As an Engineer, I want the report to be usable on various screen sizes, so that I can review results on mobile and tablet devices.

#### Acceptance Criteria

1. THE Report_Template SHALL adapt its layout for viewport widths from 320px to 2560px
2. THE Report_Template SHALL remain readable and navigable on mobile devices without horizontal scrolling
3. THE Report_Template SHALL use a collapsible navigation pattern on viewports narrower than 768px

### Requirement 19: Accessibility

**User Story:** As an Engineer, I want the report to be accessible, so that team members using assistive technologies can read test results.

#### Acceptance Criteria

1. THE Report_Template SHALL conform to WCAG 2.1 AA guidelines for colour contrast ratios
2. THE Report_Template SHALL provide text alternatives for all non-text content (charts, icons)
3. THE Report_Template SHALL be navigable using keyboard controls (Tab, Enter, Escape, Arrow keys)
4. THE Report_Template SHALL use semantic HTML elements and ARIA landmarks for screen reader navigation
5. THE Report_Template SHALL announce dynamic content updates to assistive technologies via ARIA live regions

### Requirement 20: Configuration Options

**User Story:** As an Engineer, I want to configure the HTML Reporter behaviour, so that I can customise the report for my project.

#### Acceptance Criteria

1. THE HTML_Reporter SHALL accept an `outputDirectory` option (string) for the report destination path (default: `./reports/serenity-js`)
2. THE HTML_Reporter SHALL accept a `specDirectory` option (string) for the Requirements_Hierarchy root
3. WHERE a `title` option is configured, THE Report_Template SHALL display the custom title in the report header
4. WHERE a `maxHistory` option is configured, THE HTML_Reporter SHALL retain only the specified number of most recent Test_Run_Directories (deleting older directories and their artifacts during aggregation)
5. THE HTML_Reporter SHALL accept a `stabilityWindow` option (number) specifying how many recent test runs to consider when determining test stability (default: 5)
6. IF the configured `outputDirectory` is not writable, THEN THE HTML_Reporter SHALL throw a ConfigurationError with a descriptive message
7. IF the configured `specDirectory` does not exist, THEN THE HTML_Reporter SHALL throw a ConfigurationError with a descriptive message

### Requirement 21: Output Directory Structure

**User Story:** As an Engineer, I want a predictable output directory structure, so that I can integrate the report with CI artifact publishing and understand where test data is stored.

#### Acceptance Criteria

1. THE Report_Output directory SHALL have the following structure:
   ```
   reports/serenity-js/
   ├── index.html              # Report template (regenerated each run)
   ├── data.js                 # Aggregated data snapshot (regenerated each run)
   └── test-runs/
       ├── 2024-06-14T10:00:00.000Z/
       │   ├── db.json         # Run data for this test run
       │   ├── screenshot-001.png
       │   └── video-login.webm
       └── 2024-06-15T14:30:00.000Z/
           ├── db.json         # Run data for this test run
           ├── screenshot-001.png
           └── trace-checkout.zip
   ```
2. THE Test_Run_Directory name SHALL be the ISO 8601 UTC timestamp of when the test run started (e.g. `2024-06-15T14:30:00.000Z`)
3. THE HTML_Reporter SHALL create the Test_Run_Directory at the start of the test run (before artifacts are produced) so that parallel test workers can write artifacts immediately
4. THE HTML_Reporter SHALL NOT depend on ArtifactArchiver or any external artifact management mechanism — it is solely responsible for persisting artifacts under the Report_Output directory
5. THE Report_Output directory SHALL be fully self-contained and relocatable — all internal references (data.js to artifacts, index.html to data.js) SHALL use relative paths
6. WHEN the Report_Output directory is published as a static site (e.g. GitHub Pages), THE report SHALL function correctly without server-side processing

### Requirement 22: Coverage Gaps View

**User Story:** As a Product Owner or Engineer, I want a dedicated view highlighting areas of the system with the least test coverage, so that I can identify under-tested product areas and prioritise where to add more tests.

#### Acceptance Criteria

1. THE Report_Template SHALL provide a dedicated "Coverage Gaps" view accessible from the main navigation
2. THE Report_Template SHALL display areas of the Requirements_Hierarchy that have no associated Scenes (untested directories or files)
3. THE Report_Template SHALL display areas with a high proportion of pending or skipped Scenes relative to total Scenes
4. THE Report_Template SHALL sort coverage gaps by severity (areas with no coverage first, then areas with mostly pending/skipped tests)
5. WHEN a coverage gap entry is selected, THE Report_Template SHALL navigate to the corresponding node in the Requirements Hierarchy View

### Requirement 23: System Context View

**User Story:** As an Engineer, I want a dedicated view showing the system context of the test run, so that I can understand the environment in which tests were executed and correlate failures with specific runtime conditions.

#### Acceptance Criteria

1. THE Report_Template SHALL provide a dedicated "System Context" view accessible from the main navigation
2. THE Report_Template SHALL display the Node.js version used during the test run
3. THE Report_Template SHALL display the test runner name and version (e.g. Playwright Test 1.45, Cucumber.js 12.x)
4. THE Report_Template SHALL display browser name(s) and version(s) when browser-based tests were executed
5. THE Report_Template SHALL display the operating system name and version
6. THE Report_Template SHALL display the Serenity/JS version
7. WHERE custom environment metadata is available (e.g. CI build number, branch name, commit hash), THE Report_Template SHALL display it in the system context view
8. THE HTML_Reporter SHALL collect system context information from Domain_Events (e.g. TestRunnerDetected) and from the Node.js runtime environment

#### Design Notes

- **Serenity/JS core change required:** The reporting mechanism needs to detect and emit the following data to populate the System Context view:
  - **Node.js version**: Read from `process.version` at reporter initialization
  - **OS name, version, arch**: Read from `os.platform()`, `os.release()`, `os.arch()`
  - **Serenity/JS version**: Read from `@serenity-js/core` package.json version
  - **Test runner name and version**: Already partially available via `TestRunnerDetected` domain event; may need to enrich with version info from the runner's package.json
  - **Browser names and versions**: Available from `BrowserDetected` and `BrowserVersion` tags emitted by `@serenity-js/playwright`, `@serenity-js/webdriverio` etc.
  - **CI metadata** (provider, build number, branch, commit, commit message): Detect from standard CI environment variables (GITHUB_*, GITLAB_CI, JENKINS_*, CIRCLECI, etc.)
- **Possible approach**: Emit a `SystemContextDetected` domain event early in the test run (or enrich `TestRunFinished`) carrying all system context as a structured object. The HTML reporter collects this and serialises it into the `systemContext` property of `data.js`.
- **Priority:** Address after the initial HTML reporter implementation is stable.

### Requirement 24: Performance / Speedboard View

**User Story:** As an Engineer, I want a dedicated view ranking tests by execution duration (slowest first), so that I can identify which tests to optimise for faster CI feedback.

#### Acceptance Criteria

1. THE Report_Template SHALL provide a dedicated "Speedboard" view accessible from the main navigation
2. THE Report_Template SHALL list all Scenes sorted by duration in descending order (slowest first)
3. THE Report_Template SHALL display the duration, test name, source file location, and browser/project badge for each entry
4. THE Report_Template SHALL display performance statistics: fastest test, slowest test, average duration, and total execution time
5. WHEN a Speedboard entry is selected, THE Report_Template SHALL navigate to the Scene Detail View for that test

### Requirement 25: Source File Location Display

**User Story:** As an Engineer, I want each test to show its source file and line number, so that I can quickly locate the relevant test code.

#### Acceptance Criteria

1. WHEN displaying a Scene in any list or detail view, THE Report_Template SHALL show the source file path and line number (e.g. `recording_items.spec.ts:36`)
2. THE source location SHALL be displayed as a secondary label beneath or alongside the Scene name
3. THE Data_Snapshot SHALL include the source file location for each Scene as a path relative to the configured `specDirectory` (not the absolute path or workspace-root-relative path)
4. THE HTML_Reporter SHALL strip the `specDirectory` prefix from source file paths before including them in the Run_Data_File

### Requirement 26: Quick Outcome Filter Bar

**User Story:** As an Engineer or Product Owner, I want prominent one-click filter chips for each outcome status (All, Passed, Failed, Pending, Skipped, Compromised), so that I can instantly focus on the subset of results I care about.

#### Acceptance Criteria

1. THE Report_Template SHALL display a filter bar at the top of the Scene list showing chips for: All, Passed, Failed, Pending, Skipped, Compromised — each with a count of matching Scenes
2. WHEN a filter chip is clicked, THE Report_Template SHALL immediately filter the Scene list to show only Scenes with the corresponding outcome
3. THE Report_Template SHALL visually highlight the currently active filter
4. THE Report_Template SHALL update the URL hash to reflect the active filter for bookmarking and sharing
5. THE Report_Template SHALL support a `non-passing` composite filter (accessible via URL hash `?filter=non-passing`) that shows all Scenes with outcomes other than SUCCESS

### Requirement 27: Browser/Project Badge per Test

**User Story:** As an Engineer, I want to see which browser or project configuration each test ran under, so that I can quickly identify browser-specific failures.

#### Acceptance Criteria

1. WHEN a Scene was executed under a specific browser or project configuration, THE Report_Template SHALL display a badge (e.g. "chromium", "firefox", "webkit") next to the Scene name
2. THE badge SHALL be clickable to filter the Scene list to only tests from that browser/project
3. THE Run_Data_File SHALL include the browser/project tag for each Scene as captured from the SceneTagged domain events

### Requirement 28: Retry Execution Grouping

**User Story:** As an Engineer, I want retried test executions grouped together in the same view with the ability to switch between attempts, so that I can compare what changed between the failed attempt and the successful retry to understand the root cause of intermittent failures.

#### Acceptance Criteria

1. WHEN a Scene was retried one or more times within the same Test_Run, THE Report_Template SHALL group all retry attempts together in the Scene Detail View
2. THE Report_Template SHALL display tabs or a selector allowing the user to switch between retry attempts (e.g. "Attempt 1 (failed)", "Attempt 2 (passed)")
3. THE Report_Template SHALL display the outcome of each retry attempt with visual distinction (e.g. red for failed, green for passed)
4. WHEN switching between retry attempts, THE Report_Template SHALL show the full Activity_Tree, error details, and media attachments for the selected attempt
5. THE Report_Template SHALL indicate the final outcome of the test (i.e. whether the last retry passed or failed) as the primary outcome shown in list views
6. THE Report_Template SHALL display the total number of retry attempts alongside the Scene name in list views (e.g. "Login test (2 attempts)")

### Requirement 29: CI Job Link per Test Run

**User Story:** As an Engineer, I want each test run in the history to link back to its CI job, so that I can quickly navigate to the build logs and artifacts for further investigation.

#### Acceptance Criteria

1. THE Data_Snapshot `history` entries SHALL support an optional `ciJobUrl` field containing the URL to the CI job that produced that test run
2. WHEN a `ciJobUrl` is present for a history entry, THE Report_Template SHALL display a clickable link icon (opening in a new tab) next to the test run label in the Test Runs view
3. THE HTML_Reporter SHALL populate the `ciJobUrl` field from CI environment variables when available (e.g. `GITHUB_SERVER_URL + '/' + GITHUB_REPOSITORY + '/actions/runs/' + GITHUB_RUN_ID` for GitHub Actions)
4. THE HTML_Reporter SHALL support a `ciJobUrl` configuration option that accepts a URL pattern with `{buildNumber}` placeholder (e.g. `https://github.com/org/repo/actions/runs/{buildNumber}`)
5. IF no CI environment variables are detected and no `ciJobUrl` pattern is configured, THEN the `ciJobUrl` field SHALL be omitted from the history entry

#### Design Notes

- **Serenity/JS core change required:** The `@serenity-js/core` module will need to emit a domain event (or enrich an existing event like `TestRunFinished`) carrying CI metadata (job URL, build number, branch, commit). This metadata should be auto-detected from standard CI environment variables (GitHub Actions, GitLab CI, Jenkins, CircleCI, etc.) or accepted via reporter configuration.
- **Possible approaches:**
  - A new `CIMetadataDetected` domain event emitted early in the test run
  - Enriching `TestRunFinished` with optional CI context
  - A configuration-only approach where the reporter reads env vars directly
- **Priority:** Address after the initial HTML reporter implementation is stable.

### Requirement 30: README Rendering in Requirements View

**User Story:** As a Product Owner or Engineer, I want README files from the spec directory to be rendered as living documentation within the requirements hierarchy, so that I can understand what each product area does without leaving the test report.

#### Acceptance Criteria

1. WHEN a `README.md` file exists in a directory within the configured Spec_Directory, THE HTML_Reporter SHALL read its content and render it to HTML
2. THE HTML_Reporter SHALL use a lightweight Markdown parser (e.g. `marked`) to convert README content to HTML at report generation time
3. THE Data_Snapshot SHALL include the rendered HTML in the corresponding requirements hierarchy node as a `readme` property
4. THE Report_Template SHALL display the rendered README content inline when a requirements hierarchy node is expanded in the Requirements view
5. THE Report_Template SHALL style README content with proper typography: paragraph spacing, list indentation, heading hierarchy, code blocks, and links
6. THE Report_Template SHALL support READMEs at any nesting level of the Requirements_Hierarchy (not just top-level directories)
7. IF a directory does not contain a `README.md` file, THEN the `readme` property SHALL be omitted from that node in the Data_Snapshot
8. THE HTML_Reporter SHALL sanitize the rendered HTML to prevent XSS when README content contains raw HTML (strip `<script>`, `on*` attributes, etc.)
9. THE Requirements view SHALL display coverage statistics (pass rate, test count) alongside each node, integrated with the README documentation
10. THE Requirements view SHALL visually indicate nodes with no test coverage (coverage gaps) inline within the hierarchy tree

### Requirement 31: Virtual Scrolling for Large Datasets

**User Story:** As an Engineer, I want the report to remain performant with thousands of test scenarios, so that I can navigate quickly even in large test suites.

#### Acceptance Criteria

1. THE Report_Template SHALL use virtual scrolling (rendering only visible items) for the Test Scenarios list view
2. THE Report_Template SHALL use virtual scrolling for the Timeline view's scenario rows
3. WHEN the dataset contains 5000+ scenarios, THE Report_Template SHALL render only the visible rows plus a configurable overscan buffer (not the entire list)
4. THE Report_Template SHALL maintain correct scroll position and item ordering when scrolling through virtualized lists
5. WHEN the viewport is resized across the 1024px breakpoint, THE Report_Template SHALL recalculate virtualized item positions and re-render with the appropriate row height

### Requirement 32: Responsive Timeline Layout

**User Story:** As an Engineer, I want the timeline view to adapt its layout for different screen sizes, so that I can review execution timing on tablets and phones.

#### Acceptance Criteria

1. WHEN the viewport width exceeds 1024px, THE Timeline view SHALL display the desktop Gantt chart layout: scenario label on the left (380px), horizontal bar positioned by execution start time, duration label on the right, and time axis ticks above
2. WHEN the viewport width is 1024px or narrower, THE Timeline view SHALL display a stacked mobile layout: scenario name on the first line, proportional duration bar on the second line (positioned at left=0, width proportional to duration/slowest)
3. WHEN the viewport is resized between mobile and desktop breakpoints, THE Timeline view SHALL reactively switch layouts without requiring a page reload
4. THE Timeline view SHALL hide the time axis (x-axis ticks) on viewports 1024px or narrower
5. THE mobile layout rows SHALL be 52px tall; the desktop layout rows SHALL be 28px tall

### Requirement 33: Sticky Category Headers in Virtualized Scenario List

**User Story:** As an Engineer, I want category group headers to remain visible while scrolling through a category's scenarios, so that I always know which group I'm looking at.

#### Acceptance Criteria

1. WHEN the Test Scenarios view is sorted by "Category" and the user scrolls within a group, THE Report_Template SHALL display the current group's header pinned to the top of the scroll container
2. THE sticky header SHALL update to reflect the currently visible group as the user scrolls between groups
3. THE sticky header SHALL be hidden when the original group header is still visible in the viewport
4. WHEN the sort mode is changed away from "Category" (e.g. Name, Slowest, Status), THE sticky header SHALL be hidden
5. THE group headers SHALL have consistent spacing: 16px gap above the header (separating from previous group) and 16px gap below the header border (before first scenario in the group), except for the first header which has no top gap

### Requirement 34: Group Header Truncation on Narrow Viewports

**User Story:** As an Engineer viewing the report on a narrow screen, I want long category paths to be truncated from the beginning, so that the most specific (last) segment remains visible.

#### Acceptance Criteria

1. WHEN a group header text overflows its container width, THE Report_Template SHALL truncate from the left (beginning) and display an ellipsis
2. THE last segment of the category path (e.g. "Reports Failing Scenarios" in "Reporting Results › Reports Failing Scenarios") SHALL remain visible when truncation occurs
3. THE full category path SHALL remain visible on viewports wide enough to display it without overflow

### Requirement 35: Dashboard Layout with Right-Side Action Cards

**User Story:** As a Product Owner, I want the dashboard to show actionable information (new failures, unstable tests, slowest tests) in a consistent column alongside the trend chart, so that I can quickly assess what needs attention.

#### Acceptance Criteria

1. THE Dashboard SHALL use a 2-column grid layout: a wider left column containing the Test Results card (with Pass Rate and Total Failed to its right) and the Trend chart below; and a narrower right column containing New Failures, Most Unstable, and Slowest Tests cards stacked vertically
2. THE right column cards SHALL all have the same width (1fr of the 2fr/1fr grid)
3. THE "New Failures" card SHALL show up to 5 scenarios that passed in the previous run but failed in the current run, with a "View all →" link navigating to `/tests?filter=new-failures`
4. WHEN there are no new failures, THE "New Failures" card SHALL display an encouraging message: "Well done! No new failures" with a green checkmark
5. THE "Most Unstable" card SHALL show up to 5 unstable scenarios with their instability rate percentage, with a "View all →" link navigating to `/stability`
6. THE "Slowest Tests" card SHALL show the top 5 slowest scenarios with their durations, with a "View all →" link navigating to `/tests?sort=duration`
7. THE Trend chart SHALL include a Duration dataset (dashed line) plotted against a right y-axis, showing test run duration over time
8. THE right y-axis SHALL display duration values using the `formatDuration` function (handling ms, seconds, minutes, hours)
9. THE Trend chart tooltip SHALL display formatted duration (e.g. "4.2s", "2m 15s") for the Duration dataset, and filled colour boxes for each series in the legend

### Requirement 36: Pending Outcome Icon

**User Story:** As an Engineer, I want outcome icons to render consistently and be well-centered, so that the visual indicators are clear and professional.

#### Acceptance Criteria

1. THE Report_Template SHALL use an en-dash character (–) for the pending outcome icon
2. THE pending icon SHALL be vertically and horizontally centered within its circular container
3. THE outcome icons SHALL use the following characters: ✓ (passed), ✗ (failed), – (pending), ⊘ (skipped), ⚠ (compromised)

### Requirement 37: Test Runs View

**User Story:** As an Engineer, I want a dedicated view listing all historical test runs found in the data folder, so that I can navigate between runs, compare outcomes over time, and access CI job links.

#### Acceptance Criteria

1. THE Report_Template SHALL provide a dedicated "Test Runs" view accessible from the main navigation
2. THE Report_Template SHALL display all historical test runs found in the `test-runs/` directory, listed in reverse chronological order (most recent first)
3. EACH test run entry SHALL display: run label, timestamp, total duration, pass rate, and scenario count
4. WHEN a test run entry is clicked, THE Report_Template SHALL navigate to the Test Scenarios view filtered to that run (`/tests?run=N`)
5. WHERE a `ciJobUrl` is present for a test run, THE Report_Template SHALL display a clickable link icon that opens the CI job in a new tab
6. THE CI link click SHALL NOT trigger the row navigation (event propagation stopped)

### Requirement 38: Duration Formatting

**User Story:** As an Engineer, I want durations displayed in human-readable format appropriate to their magnitude, so that I can quickly understand timing at a glance.

#### Acceptance Criteria

1. THE Report_Template SHALL format duration values using the following rules:
   - Values < 1000ms: display as integer milliseconds (e.g. "85ms")
   - Values ≥ 1000ms and < 60000ms: display as seconds with one decimal (e.g. "4.2s")
   - Values ≥ 60000ms and < 3600000ms: display as minutes and seconds (e.g. "2m 15s")
   - Values ≥ 3600000ms: display as hours and minutes (e.g. "1h 3m")
2. ALL views that display durations (Dashboard, Test Scenarios, Scenario Detail, Timeline, Test Runs, Trend chart axis) SHALL use this consistent formatting
3. THE Trend chart right y-axis labels SHALL use the same duration formatting for the Duration dataset

### Requirement 39: Trend Chart Interaction

**User Story:** As an Engineer, I want to pan and zoom the trend chart when there are many historical runs, so that I can focus on a specific time range without losing the full history context.

#### Acceptance Criteria

1. THE Trend chart SHALL support horizontal panning (click-and-drag on X axis) when more data points exist than can comfortably display
2. THE Trend chart SHALL support pinch-to-zoom on touch devices
3. ON viewports ≤ 768px with more than 3 historical runs, THE Trend chart SHALL initially show only the most recent 3 runs (with the ability to pan left to see older runs)
4. ON wider viewports, THE Trend chart SHALL show all available history by default
5. Clicking a trend bar SHALL navigate to the test scenarios for that run (`/tests?run=N`)

## Functional Test Scenarios

The following test scenarios should be implemented as Playwright Test acceptance tests under `integration/html-reporter/` to verify the HTML report template behaviour. These are derived from issues discovered and behaviours identified during the template prototyping phase.

### Navigation & Routing

1. Clicking the Serenity/JS logo navigates to the dashboard (`#/`)
2. Sidebar nav items navigate to the correct hash routes
3. Sidebar collapses to icon-only mode and persists state in localStorage
4. Collapsed sidebar shows tooltips on icon hover
5. Collapsed sidebar shows the circular Serenity/JS icon (not the full wordmark)
6. Mobile hamburger menu opens/closes the sidebar overlay
7. Hash-based routing renders the correct view for all routes

### Dashboard

8. Dashboard displays total tests, pass rate, test run duration, and slowest test cards
9. Donut chart shows correct outcome breakdown proportions
10. Clicking donut legend items navigates to test scenarios with the appropriate filter
11. Trend chart bars are clickable and navigate to the corresponding test run
12. Trend bar tooltips show full outcome breakdown (passed, failed, pending, skipped, compromised)
13. Slowest tests list items navigate to the corresponding scenario detail view
14. Pass rate card click navigates to non-passing filter
15. Dashboard layout adapts responsively on narrow viewports

### Test Scenarios View

16. Scenarios are grouped by category with sticky headers by default
17. Clicking a category segment in a sticky header populates the search with exact match
18. Search with double quotes matches exact substring
19. Search without quotes matches all words (AND logic)
20. Search includes tag names (not just scenario name and category)
21. Clearing the search shows all scenarios again
22. Filter chips (All, Passed, Failed, Pending, Skipped, Compromised) filter the list correctly
23. Sort select dropdown (Category, Name, Slowest, Status) changes the list order
24. Sort "Status" puts failures first, then errors, compromised, pending, skipped, passing last
25. Sort "Slowest" orders by duration descending
26. Sort "Name" produces alphabetical flat list (no category groups)
27. All filter/sort/search state is preserved in the URL hash and deep-linkable
28. URL hash state is restored on page load
29. Run selector pills switch between test runs via `?run=N`
30. Clicking the latest run pill removes `?run=` from URL
31. Historical run banner appears when viewing a non-latest run
32. "show latest" link in the banner removes the run parameter
33. Clicking a scenario navigates to its detail view, preserving `?run=N` if set
34. Tag chips on scenario rows are clickable and filter to that tag
35. Tag chips display the tag name without adding extra `@` prefix (avoiding `@@`)
36. Browser badges display correctly for scenarios with browser tags
37. Status filter and sort select are on the same row on wide viewports
38. Sort select wraps to its own left-aligned row on narrow viewports (≤768px)

### Test Scenario Detail View

39. Breadcrumb shows "Test Scenarios › Category › Subcategory › Scenario name"
40. Breadcrumb "Test Scenarios" link preserves `?run=N` context
41. Breadcrumb category segments populate search with exact match on click
42. Execution history blocks are displayed above the narrative and cast sections
43. Execution history blocks highlight the currently viewed run with a ring
44. Clicking an execution history block navigates to that run's detail (`?run=N`)
45. Copy button copies the test source path to clipboard
46. Narrative (feature description) renders as italic blockquote when present
47. Tags display as chips in the detail header
48. Execution history appears between tags and narrative (order: tags → history → narrative → cast)
49. Cast section displays actor names and their abilities with details
50. Activity tree renders hierarchically with correct indentation
51. Activity tree shows data tables as HTML tables below steps
52. Activity tree shows docstrings as formatted pre blocks below steps
53. Nested activities (Task containing Interactions) render recursively
54. Retry tabs switch between attempt activity trees
55. Error block shows error name, message, and stack trace
56. Scenario with missing `cast` field does not crash the view
57. Scenario with missing `tags` field does not crash the view
58. Scenario with missing `executionHistory` field does not crash the view
59. Navigating to a non-existent scenario shows "Test scenario not found"

### Tags View

60. Tags are grouped by type (Feature, Issue, Tag, Browser) with section headers
61. Each tag card shows name, scenario count, and colour-coded pass rate with progress bar
62. Clicking a tag card navigates to test scenarios filtered by that tag name
63. Pass rate tooltip shows "Pass rate: X%"
64. Grid layout adapts to viewport width (responsive columns)

### Errors View

65. Errors are grouped by type category (Assertion Errors, Compromised Tests, Timeout Errors, Runtime Errors)
66. Summary cards are compact single-line layout (title + count on one row)
67. Each error entry shows scenario name, source path, and error message (no stack trace)
68. Clicking an error entry navigates to the scenario detail view
69. Run selector pills allow viewing errors from historical runs
70. Historical run banner appears with "show latest" link
71. Error list uses virtualized rendering — only visible rows exist in the DOM
72. Sticky category headers remain pinned when scrolling within an error type group
73. Error category headers are left-aligned (not reversed by RTL direction)
74. Sticky header shows icon, category name, and count when scrolled past a group

### Requirements View

75. Requirements hierarchy displays as an expandable tree with directories and files
76. Directory nodes expand/collapse on click, files navigate to filtered test scenarios
77. README content renders as styled HTML when a directory node is expanded
78. README bullet lists are properly indented
79. Coverage stats (Coverage %, Pass Rate %, Gaps) display as compact single-line cards
80. Nodes with no tests show "No tests" indicator in red
81. Multiple nesting levels render with correct indentation

### Stability View

82. Unstable tests are grouped by category with sticky headers
83. "State:" label precedes the filter pills (Unstable, Regressed, Recovered)
84. Sort select dropdown (Category, Name) is on the same row as state filters on wide viewports
85. Sort select wraps to its own left-aligned row on narrow viewports (≤768px)
86. Outcome history mini-chart shows pass/fail pattern across runs
87. Instability percentage is displayed per test
88. Clicking an unstable test navigates to its scenario detail
89. Stability list uses virtualized rendering with sticky category headers

### Timeline View

90. Stats cards are compact single-line layout (title + value on one row)
91. Execution order toggle shows Gantt-chart with time axis
92. Slowest first toggle shows bars sorted by duration
93. Clicking a timeline row navigates to the scenario detail
94. Test names are visible in each row alongside the duration bar

### Test Runs View

95. Runs are listed in reverse chronological order (most recent first)
96. Each run shows label, timestamp, duration, pass rate, and scenario count
97. CI link opens in new tab without triggering row navigation
98. CI link has proper contrast in both light and dark modes
99. Clicking a run row navigates to test scenarios for that run

### System Context View

100. Node.js version, test runner, OS, Serenity/JS version are displayed
101. CI/CD section shows provider, build number, branch, commit when available

### Theme & Accessibility

102. Dark mode is detected from OS preference on first load
103. Theme toggle switches between dark and light modes
104. Theme preference persists in localStorage across reloads
105. All text elements have minimum 12px font size (no text smaller than 0.75rem)
106. Breadcrumb links have sufficient contrast in dark mode (#a5a7ff)
107. Tag chips have sufficient contrast in dark mode (--text-primary colour)
108. Font size scale uses CSS custom properties (adjustable from one place)

### Data Loading & Edge Cases

109. Report renders correctly when loaded via `file://` protocol
110. Report renders when `data.js` has no history (empty `history` array)
111. Report renders when `data.js` has no tags (empty `tags` array)
112. Report renders when `data.js` has no requirements (`requirements` is null)
113. Report handles scenarios with missing optional fields (cast, tags, executionHistory, activities) without crashing

### Virtual Scrolling & Performance

114. Timeline view uses virtualized rendering — only visible rows exist in the DOM
115. Test Scenarios list uses virtualized rendering — only visible rows exist in the DOM
116. Errors view list uses virtualized rendering — only visible rows exist in the DOM
117. Stability view list uses virtualized rendering — only visible rows exist in the DOM
118. Scrolling through 100+ scenarios in the list does not create more than ~50 DOM nodes
119. Virtual scroll maintains correct item order after scrolling to bottom and back to top
120. Sticky group header appears when scrolling within a category group
121. Sticky group header updates to show the correct category when crossing group boundaries
122. Sticky group header is hidden when sort mode is not "Category"
123. Group headers have z-index above scenario items (no text overlap)
124. Scenario row height (66px) contains all content without overflow into adjacent items
125. Sticky header text is not cropped (header height accommodates padding + text line-height)

### Responsive Timeline

126. At viewport >1024px, timeline shows desktop Gantt layout (label | bar | duration)
127. At viewport ≤1024px, timeline shows stacked mobile layout (name + bar below)
128. Resizing from desktop to tablet switches timeline to stacked layout without reload
129. Resizing from tablet to desktop switches timeline to Gantt layout without reload
130. Desktop timeline shows time axis ticks above the Gantt chart
131. Mobile/tablet timeline hides the time axis ticks
132. Mobile timeline bar uses `left: 0` (proportional width, not timeline-offset)

### Group Header Truncation

133. On narrow viewports, long group headers truncate from the left with ellipsis
134. The last segment of a multi-level category path remains visible when truncated
135. On wide viewports, the full category path displays without truncation

### Dashboard Layout

136. Dashboard displays 2-column grid: left (test results + trend) and right (action cards)
137. Right column shows New Failures, Most Unstable, Slowest Tests in that order
138. All right column cards have the same width
139. "New Failures" card shows up to 5 entries with "View all →" link to `/tests?filter=new-failures`
140. "New Failures" card shows "Well done! No new failures" when empty
141. "Most Unstable" card shows up to 5 entries with "View all →" link to `/stability`
142. "Slowest Tests" card shows top 5 with "View all →" link to `/tests?sort=duration`
143. Clicking a slowest test entry navigates to its scenario detail
144. Clicking a new failure entry navigates to its scenario detail
145. Clicking a most unstable entry navigates to its scenario detail
146. Pass Rate card navigates to `/tests?filter=non-passing` on click
147. Total Failed card navigates to `/tests?filter=failed` on click
148. "Requirements" link in Pass Rate card navigates to `/requirements`
149. Trend chart includes Duration dataset as dashed purple line on right y-axis
150. Trend chart right y-axis labels use formatDuration (handles ms/s/m/h)
151. Trend chart tooltip shows formatted duration for Duration series
152. Trend chart tooltip legend boxes are filled with solid dataset colours
153. Dashboard does not overflow horizontally after resize cycle (wide → narrow → wide)

### Responsive Layout

154. Main content area does not overflow horizontally at any viewport width
155. Dashboard grid columns use `minmax(0, Xfr)` to prevent content from expanding beyond container
156. Pending scenarios show an en-dash (–) icon that is centered in the outcome circle

### Data Layer — Report Generation (unit/integration tests)

157. HTML_Reporter creates a Test_Run_Directory named with ISO 8601 UTC timestamp on TestRunFinishes
158. HTML_Reporter writes db.json to the Test_Run_Directory containing complete test execution data
159. HTML_Reporter stores screenshot artifacts in the Test_Run_Directory with unique filenames
160. HTML_Reporter stores video artifacts in the Test_Run_Directory
161. HTML_Reporter stores trace file artifacts in the Test_Run_Directory
162. HTML_Reporter does not use or depend on ArtifactArchiver
163. HTML_Reporter creates the Test_Run_Directory before artifacts are produced (at test run start)

### Data Layer — Aggregation (unit/integration tests)

164. HTML_Reporter aggregates all `test-runs/*/db.json` files into `data.js` on TestRunFinishes
165. Aggregated `data.js` assigns data to `window.__SERENITY_REPORT_DATA__`
166. Aggregated `data.js` contains a `history` array ordered chronologically (oldest first)
167. Aggregated `data.js` contains `scenes` from the latest test run
168. Aggregated `data.js` derives execution history per scene by correlating across Run_Data_Files (matching by source file path + line number)
169. Aggregated `data.js` identifies unstable tests from cross-run outcome variation within the stability window
170. Aggregated `data.js` includes artifact references as relative paths from the Report_Output root (e.g. `test-runs/2024-06-15T14:30:00.000Z/screenshot-001.png`)
171. When `maxHistory` is configured, aggregation retains only the N most recent Test_Run_Directories
172. When `maxHistory` is configured, aggregation deletes older Test_Run_Directories and their artifacts
173. Aggregation produces valid JavaScript when `data.js` is evaluated (no syntax errors, proper escaping)
174. Aggregation handles a single Test_Run_Directory (first run, no prior history)
175. Aggregation handles Run_Data_Files with missing optional fields without crashing

### Data Layer — Run Data File Format (unit tests)

176. Run_Data_File is valid JSON parseable by `JSON.parse`
177. Run_Data_File contains: timestamp, duration, outcome counts, scenarios array
178. Run_Data_File scenario entries include: name, category, outcome, duration, startedAt, source location, tags, activity tree
179. Run_Data_File includes artifact references as relative paths within the Test_Run_Directory
180. Duration values are serialized as numeric milliseconds
181. Timestamp values are serialized as ISO 8601 strings
182. Outcome values are serialized as string identifiers (SUCCESS, FAILURE, PENDING, SKIPPED, COMPROMISED, ERROR)
183. Activity trees preserve parent-child nesting structure
184. Round-trip: serializing scene data to JSON and parsing it back produces equivalent objects

### Data Layer — Output Directory Structure (integration tests)

185. First test run creates `reports/serenity-js/` directory structure with index.html, data.js, and test-runs/ subdirectory
186. Second test run creates a new Test_Run_Directory without affecting the first
187. After two test runs, `data.js` history array contains two entries
188. Report_Output is self-contained — all paths are relative and the directory is relocatable
189. Report functions correctly when the entire output directory is served via static HTTP
190. Report functions correctly when opened via `file://` protocol after being moved to a different location

### Air-Gap & Bundling (integration tests)

191. Generated `index.html` contains no `<script src="http` or `<link href="http` external references
192. Generated `index.html` inlines Preact library code within a `<script>` tag
193. Generated `index.html` inlines Chart.js library code within a `<script>` tag
194. Generated `index.html` inlines chartjs-plugin-zoom library code within a `<script>` tag
195. Generated `index.html` inlines @tanstack/virtual-core library code within a `<script>` tag
196. Generated `index.html` contains no `@import` CSS rules referencing external URLs
197. Report renders all views correctly with network requests blocked (offline mode)
198. The only network requests when viewing the report are for user artifacts (screenshots, videos) referenced in `test-runs/` subdirectories

### Duration Formatting

199. Duration < 1000ms displays as integer milliseconds (e.g. "85ms")
200. Duration ≥ 1s and < 60s displays as seconds with one decimal (e.g. "4.2s")
201. Duration ≥ 60s and < 1h displays as minutes and seconds (e.g. "2m 15s")
202. Duration ≥ 1h displays as hours and minutes (e.g. "1h 3m")
203. Duration formatting is consistent across all views (dashboard, scenarios, timeline, test runs, trend chart)

### Trend Chart Interaction

204. Trend chart supports horizontal panning when many runs are available
205. On narrow viewports (≤768px) with >3 runs, trend chart initially shows only the last 3
206. On wide viewports, trend chart shows all available runs
207. Clicking a trend bar navigates to the corresponding test run

### Stability Window

208. With `stabilityWindow` defaulting to 5, only the last 5 executions are considered when determining unstable tests
209. A test that was unstable 10 runs ago but stable for the last 5 runs is NOT shown as unstable
210. With `stabilityWindow` set to 3, only the last 3 executions are considered for stability
211. Instability percentage is calculated based on the stability window, not all historical runs

### Non-Passing Filter

212. URL `#/tests?filter=non-passing` shows all scenarios with outcomes other than SUCCESS
213. Pass Rate card on dashboard navigates to `/tests?filter=non-passing`
214. Non-passing filter includes FAILURE, PENDING, SKIPPED, COMPROMISED, and ERROR outcomes

### Test Runs View

215. Test Runs view is accessible from the sidebar navigation
216. All historical test runs from `test-runs/` directory are displayed
217. Runs are ordered with most recent first
218. Each entry shows run label, timestamp, duration, pass rate, and scenario count
219. Clicking a run navigates to `/tests?run=N`
220. CI job link icon opens in new tab when `ciJobUrl` is present
221. CI link click does not trigger row navigation
