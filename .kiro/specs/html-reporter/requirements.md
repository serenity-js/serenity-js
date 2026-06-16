# Requirements Document

## Introduction

The `@serenity-js/html-reporter` module is a pure static HTML reporter for Serenity/JS that replaces the Java-based Serenity BDD CLI. It produces a self-contained report consisting of only two files: `index.html` (with all CSS and JS embedded inline) and `data.js` (test results assigned to a global variable). The `data.js` file is updated on each subsequent test run to accumulate execution history and trend data. The report works on `file://` protocol, GitHub Pages, GitLab Pages, S3, and any static hosting without a backend or fetch API.

**Visual Design Reference:** The report UI should follow the clean, card-based dashboard style of the Materio Vuetify admin template: https://demos.themeselection.com/materio-vuetify-nuxtjs-admin-template-free/demo/dashboard — using a similar approach to layout, spacing, card elevation, typography, and colour palette for both light and dark modes.

## Glossary

- **HTML_Reporter**: The `@serenity-js/html-reporter` StageCrewMember that collects domain events and produces the static HTML report
- **Report_Output**: The output directory containing the generated report files (index.html, data.js)
- **Data_File**: The `data.js` file containing serialized test results assigned to `window.__SERENITY_REPORT_DATA__`, updated on each test run to accumulate historical data
- **Report_Template**: The static HTML/CSS/JS template that renders the report from the global data variable
- **Scene**: A single test scenario (e.g. a Playwright Test `test()`, a Cucumber scenario, a Mocha `it()`)
- **Activity_Tree**: The hierarchical tree of Tasks, Interactions, and their outcomes within a Scene
- **Domain_Event**: An event emitted by Serenity/JS core during a test run (SceneStarts, InteractionFinished, etc.)
- **Stage**: The Serenity/JS messaging infrastructure that distributes Domain_Events to StageCrewMembers
- **StageCrewMember**: An interface for in-memory services that react to Domain_Events published by the Stage
- **StageCrewMemberBuilder**: A factory interface for creating complex StageCrewMembers with injected dependencies
- **Artifact**: A file-based output produced during a test run (screenshot, JSON report, etc.)
- **Tag**: A metadata label attached to a Scene (e.g. feature name, issue reference, capability)
- **Requirements_Hierarchy**: A tree structure that mirrors the user's directory layout under the Spec_Directory, with no predefined semantic meaning per nesting level — directories are simply navigable grouping nodes and test files can appear at any depth
- **Spec_Directory**: The configurable root directory from which the Requirements_Hierarchy is derived
- **Test_Run**: A complete execution of the test suite, producing one set of results
- **Trend_Data**: Historical test run summaries accumulated within the Data_File's `history` array across successive test runs
- **Flaky_Test**: A test that has both passed and failed across recent Test_Runs without code changes

## Requirements

### Requirement 1: StageCrewMember Integration

**User Story:** As an Engineer, I want the HTML Reporter to integrate as a standard StageCrewMember, so that I can configure it using the same crew pattern as other reporters.

#### Acceptance Criteria

1. THE HTML_Reporter SHALL implement the StageCrewMember interface from `@serenity-js/core`
2. THE HTML_Reporter SHALL provide a static `fromJSON` factory method that returns a StageCrewMemberBuilder
3. WHEN the HTML_Reporter is assigned to a Stage, THE HTML_Reporter SHALL begin collecting Domain_Events
4. THE HTML_Reporter SHALL support configuration via the crew array in test runner configuration (Playwright Test, WebdriverIO, Cucumber, Mocha, Jasmine)
5. THE HTML_Reporter SHALL accept an `outputDirectory` configuration option specifying the Report_Output path
6. THE HTML_Reporter SHALL default the `outputDirectory` to `./target/site/serenity-html` when no configuration is provided
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

1. WHEN a TestRunFinishes event is received, THE HTML_Reporter SHALL generate the Report_Output directory
2. THE HTML_Reporter SHALL write the Data_File containing serialized test results assigned to `window.__SERENITY_REPORT_DATA__`
3. THE HTML_Reporter SHALL write the `index.html` file (with all CSS and JS embedded inline) to the Report_Output directory
4. IF the `index.html` file already exists in the Report_Output directory, THEN THE HTML_Reporter SHALL overwrite it with the latest version
4. THE HTML_Reporter SHALL emit an AsyncOperationAttempted event before report generation begins
5. THE HTML_Reporter SHALL emit an AsyncOperationCompleted event when report generation succeeds
6. IF report generation fails, THEN THE HTML_Reporter SHALL emit an AsyncOperationFailed event with the error details
7. THE HTML_Reporter SHALL complete report generation within 10 seconds for a test suite of up to 1000 Scenes
8. THE HTML_Reporter SHALL produce valid UTF-8 encoded output files supporting international characters

### Requirement 4: Data File Format

**User Story:** As an Engineer, I want the data file to use a global variable assignment pattern, so that the report works on file:// protocol without fetch or CORS issues.

#### Acceptance Criteria

1. THE Data_File SHALL assign test results to `window.__SERENITY_REPORT_DATA__` as a JavaScript object literal
2. THE Data_File SHALL contain a `summary` property with pass, fail, pending, skipped, and compromised counts
3. THE Data_File SHALL contain a `scenes` array with one entry per Scene, including name, outcome, duration, tags, and Activity_Tree
4. THE Data_File SHALL contain a `tags` array listing all unique Tags with their associated Scene counts
5. THE Data_File SHALL contain a `requirements` property representing the Requirements_Hierarchy tree
6. THE Data_File SHALL escape special characters in string values to produce valid JavaScript
7. THE Data_File SHALL include artifact references (screenshot paths, video paths) as relative URLs from the Report_Output directory
8. WHEN the `data.js` file is included via a `<script>` tag, THE Data_File SHALL be parseable by any standard JavaScript engine without errors

### Requirement 5: Data File Serialisation

**User Story:** As a developer, I want to ensure the data serialisation is correct and lossless, so that the report accurately represents test execution results.

#### Acceptance Criteria

1. THE HTML_Reporter SHALL produce a Data_File that, when evaluated by a JavaScript engine, produces an object structurally equivalent to the in-memory representation
2. FOR ALL Scene records collected during a test run, serialising to Data_File and evaluating the result SHALL produce objects with the same property values (round-trip property)
3. THE HTML_Reporter SHALL serialise Duration values as numeric milliseconds
4. THE HTML_Reporter SHALL serialise Timestamp values as ISO 8601 strings
5. THE HTML_Reporter SHALL serialise Outcome values as string identifiers (e.g. "SUCCESS", "FAILURE", "PENDING", "SKIPPED", "COMPROMISED", "ERROR")
6. THE HTML_Reporter SHALL serialise the Activity_Tree as nested arrays preserving parent-child relationships

### Requirement 6: Static Report Template

**User Story:** As an Engineer, I want the report to be a fully static website, so that I can open it on file:// protocol, deploy to GitHub Pages, or serve from any static host without a backend.

#### Acceptance Criteria

1. THE Report_Template SHALL load test data exclusively from the `window.__SERENITY_REPORT_DATA__` global variable set by the `data.js` script
2. THE Report_Output SHALL consist of exactly two files: `index.html` (with all CSS and JS embedded inline) and `data.js`
3. THE `index.html` file SHALL include the `data.js` file via a `<script src="./data.js"></script>` tag
4. THE Report_Template SHALL render correctly when opened via `file://` protocol in a modern browser
5. THE Report_Template SHALL render correctly when served from any static hosting (GitHub Pages, GitLab Pages, S3)
6. THE Report_Template SHALL use no fetch API, XMLHttpRequest, or WebSocket calls for loading test data
7. THE Report_Template SHALL use a client-side framework (Preact or similar lightweight library) for rendering, bundled inline within `index.html`
8. THE `index.html` SHALL have no external dependencies (no CDN links, no separate CSS/JS files other than `data.js`)

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
5. THE Report_Template SHALL reference media files using relative paths from the Report_Output directory
6. THE HTML_Reporter SHALL copy referenced media files into the Report_Output directory during report generation
7. THE Report_Template SHALL display a placeholder when a referenced media file is missing
8. WHEN a Scene has associated log attachments (browser logs, stdout/stderr, server logs, or other textual data), THE Report_Template SHALL display them as expandable text blocks within the Scene Detail View
9. THE Report_Template SHALL support the following attachment types: screenshots (per step), video recordings (per test), Playwright trace files (per test), and text logs (per test or per step)

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

1. WHEN a previous `data.js` file exists in the Report_Output directory, THE HTML_Reporter SHALL read it to retrieve historical Test_Run data before writing the updated file
2. THE Data_File SHALL contain a `history` array with summary results from previous Test_Runs (timestamp, outcome counts, optional build label)
3. THE HTML_Reporter SHALL append the current Test_Run's summary to the `history` array when writing `data.js`
4. THE Report_Template SHALL display trend data as a line or bar chart showing outcome counts per historical run
5. WHERE a maximum history limit is configured, THE HTML_Reporter SHALL retain only the most recent N entries in the `history` array

### Requirement 14: Error Analysis View

**User Story:** As an Engineer, I want a dedicated error report showing all errors that occurred during the test run sorted by impact, so that I can quickly identify systemic issues (e.g. a broken login selector affecting dozens of tests, or a database connection error reported by an API healthcheck) and distinguish high-impact root causes from isolated failures.

#### Acceptance Criteria

1. THE Report_Template SHALL display a dedicated error analysis view listing all distinct errors that occurred during the test run
2. THE Report_Template SHALL group errors by their message (or a normalised form of their message) and display the count of affected Scenes per error
3. THE Report_Template SHALL sort error groups by the number of affected Scenes in descending order (most impactful errors first)
4. WHEN an error group is selected, THE Report_Template SHALL list all Scenes affected by that error with links to their detail views
5. THE Report_Template SHALL display the error type/class name, the error message, and an example stack trace for each error group
6. THE Report_Template SHALL visually distinguish errors that affected a large proportion of the test run (e.g. >50% of failed Scenes) as potential root causes

### Requirement 15: Flaky Tests View

**User Story:** As an Engineer or Product Owner, I want a dedicated flaky tests view showing the most unstable areas of the system, so that I can prioritise fixing unreliable tests and assess which parts of the system are least trustworthy.

#### Acceptance Criteria

1. THE Report_Template SHALL provide a dedicated "Flaky Tests" view accessible from the main navigation
2. WHILE Trend_Data from multiple Test_Runs is available, THE Report_Template SHALL identify Scenes that have both passed and failed across recent runs
3. THE Report_Template SHALL list all identified Flaky_Tests sorted by instability (most flaky first)
4. THE Report_Template SHALL display the pass/fail ratio for each Flaky_Test across available Trend_Data
5. THE Report_Template SHALL group flaky tests by their location in the Requirements_Hierarchy (when available) so users can identify which areas of the system are most unstable
6. WHEN a Flaky_Test entry is selected, THE Report_Template SHALL navigate to the Scene Detail View for that test

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

1. THE HTML_Reporter SHALL accept an `outputDirectory` option (string) for the report destination path
2. THE HTML_Reporter SHALL accept a `specDirectory` option (string) for the Requirements_Hierarchy root
3. WHERE a `title` option is configured, THE Report_Template SHALL display the custom title in the report header
4. WHERE a `maxHistory` option is configured, THE HTML_Reporter SHALL retain only the specified number of historical data files
5. IF the configured `outputDirectory` is not writable, THEN THE HTML_Reporter SHALL throw a ConfigurationError with a descriptive message
6. IF the configured `specDirectory` does not exist, THEN THE HTML_Reporter SHALL throw a ConfigurationError with a descriptive message

### Requirement 21: Coverage Gaps View

**User Story:** As a Product Owner or Engineer, I want a dedicated view highlighting areas of the system with the least test coverage, so that I can identify under-tested product areas and prioritise where to add more tests.

#### Acceptance Criteria

1. THE Report_Template SHALL provide a dedicated "Coverage Gaps" view accessible from the main navigation
2. THE Report_Template SHALL display areas of the Requirements_Hierarchy that have no associated Scenes (untested directories or files)
3. THE Report_Template SHALL display areas with a high proportion of pending or skipped Scenes relative to total Scenes
4. THE Report_Template SHALL sort coverage gaps by severity (areas with no coverage first, then areas with mostly pending/skipped tests)
5. WHEN a coverage gap entry is selected, THE Report_Template SHALL navigate to the corresponding node in the Requirements Hierarchy View

### Requirement 22: System Context View

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

### Requirement 23: Performance / Speedboard View

**User Story:** As an Engineer, I want a dedicated view ranking tests by execution duration (slowest first), so that I can identify which tests to optimise for faster CI feedback.

#### Acceptance Criteria

1. THE Report_Template SHALL provide a dedicated "Speedboard" view accessible from the main navigation
2. THE Report_Template SHALL list all Scenes sorted by duration in descending order (slowest first)
3. THE Report_Template SHALL display the duration, test name, source file location, and browser/project badge for each entry
4. THE Report_Template SHALL display performance statistics: fastest test, slowest test, average duration, and total execution time
5. WHEN a Speedboard entry is selected, THE Report_Template SHALL navigate to the Scene Detail View for that test

### Requirement 24: Source File Location Display

**User Story:** As an Engineer, I want each test to show its source file and line number, so that I can quickly locate the relevant test code.

#### Acceptance Criteria

1. WHEN displaying a Scene in any list or detail view, THE Report_Template SHALL show the source file path and line number (e.g. `recording_items.spec.ts:36`)
2. THE source location SHALL be displayed as a secondary label beneath or alongside the Scene name
3. THE Data_File SHALL include the source file location for each Scene as a path relative to the configured `specDirectory` (not the absolute path or workspace-root-relative path)
4. THE HTML_Reporter SHALL strip the `specDirectory` prefix from source file paths before including them in the Data_File

### Requirement 25: Quick Outcome Filter Bar

**User Story:** As an Engineer or Product Owner, I want prominent one-click filter links for each outcome status (All, Passed, Failed, Flaky, Skipped), so that I can instantly focus on the subset of results I care about.

#### Acceptance Criteria

1. THE Report_Template SHALL display a filter bar at the top of the Scene list showing links for: All, Passed, Failed, Flaky, Skipped — each with a count of matching Scenes
2. WHEN a filter link is clicked, THE Report_Template SHALL immediately filter the Scene list to show only Scenes with the corresponding outcome
3. THE Report_Template SHALL visually highlight the currently active filter
4. THE Report_Template SHALL update the URL hash to reflect the active filter for bookmarking and sharing

### Requirement 26: Browser/Project Badge per Test

**User Story:** As an Engineer, I want to see which browser or project configuration each test ran under, so that I can quickly identify browser-specific failures.

#### Acceptance Criteria

1. WHEN a Scene was executed under a specific browser or project configuration, THE Report_Template SHALL display a badge (e.g. "chromium", "firefox", "webkit") next to the Scene name
2. THE badge SHALL be clickable to filter the Scene list to only tests from that browser/project
3. THE Data_File SHALL include the browser/project tag for each Scene as captured from the SceneTagged domain events

### Requirement 27: Retry Execution Grouping

**User Story:** As an Engineer, I want retried test executions grouped together in the same view with the ability to switch between attempts, so that I can compare what changed between the failed attempt and the successful retry to understand the root cause of intermittent failures.

#### Acceptance Criteria

1. WHEN a Scene was retried one or more times within the same Test_Run, THE Report_Template SHALL group all retry attempts together in the Scene Detail View
2. THE Report_Template SHALL display tabs or a selector allowing the user to switch between retry attempts (e.g. "Attempt 1 (failed)", "Attempt 2 (passed)")
3. THE Report_Template SHALL display the outcome of each retry attempt with visual distinction (e.g. red for failed, green for passed)
4. WHEN switching between retry attempts, THE Report_Template SHALL show the full Activity_Tree, error details, and media attachments for the selected attempt
5. THE Report_Template SHALL indicate the final outcome of the test (i.e. whether the last retry passed or failed) as the primary outcome shown in list views
6. THE Report_Template SHALL display the total number of retry attempts alongside the Scene name in list views (e.g. "Login test (2 attempts)")

### Requirement 28: CI Job Link per Test Run

**User Story:** As an Engineer, I want each test run in the history to link back to its CI job, so that I can quickly navigate to the build logs and artifacts for further investigation.

#### Acceptance Criteria

1. THE Data_File `history` entries SHALL support an optional `ciJobUrl` field containing the URL to the CI job that produced that test run
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

### Requirement 29: README Rendering in Requirements View

**User Story:** As a Product Owner or Engineer, I want README files from the spec directory to be rendered as living documentation within the requirements hierarchy, so that I can understand what each product area does without leaving the test report.

#### Acceptance Criteria

1. WHEN a `README.md` file exists in a directory within the configured Spec_Directory, THE HTML_Reporter SHALL read its content and render it to HTML
2. THE HTML_Reporter SHALL use a lightweight Markdown parser (e.g. `marked`) to convert README content to HTML at report generation time
3. THE Data_File SHALL include the rendered HTML in the corresponding requirements hierarchy node as a `readme` property
4. THE Report_Template SHALL display the rendered README content inline when a requirements hierarchy node is expanded in the Requirements view
5. THE Report_Template SHALL style README content with proper typography: paragraph spacing, list indentation, heading hierarchy, code blocks, and links
6. THE Report_Template SHALL support READMEs at any nesting level of the Requirements_Hierarchy (not just top-level directories)
7. IF a directory does not contain a `README.md` file, THEN the `readme` property SHALL be omitted from that node in the Data_File
8. THE HTML_Reporter SHALL sanitize the rendered HTML to prevent XSS when README content contains raw HTML (strip `<script>`, `on*` attributes, etc.)
9. THE Requirements view SHALL display coverage statistics (pass rate, test count) alongside each node, integrated with the README documentation
10. THE Requirements view SHALL visually indicate nodes with no test coverage (coverage gaps) inline within the hierarchy tree

### Requirement 30: Virtual Scrolling for Large Datasets

**User Story:** As an Engineer, I want the report to remain performant with thousands of test scenarios, so that I can navigate quickly even in large test suites.

#### Acceptance Criteria

1. THE Report_Template SHALL use virtual scrolling (rendering only visible items) for the Test Scenarios list view
2. THE Report_Template SHALL use virtual scrolling for the Timeline view's scenario rows
3. WHEN the dataset contains 5000+ scenarios, THE Report_Template SHALL render only the visible rows plus a configurable overscan buffer (not the entire list)
4. THE Report_Template SHALL maintain correct scroll position and item ordering when scrolling through virtualized lists
5. WHEN the viewport is resized across the 1024px breakpoint, THE Report_Template SHALL recalculate virtualized item positions and re-render with the appropriate row height

### Requirement 31: Responsive Timeline Layout

**User Story:** As an Engineer, I want the timeline view to adapt its layout for different screen sizes, so that I can review execution timing on tablets and phones.

#### Acceptance Criteria

1. WHEN the viewport width exceeds 1024px, THE Timeline view SHALL display the desktop Gantt chart layout: scenario label on the left (380px), horizontal bar positioned by execution start time, duration label on the right, and time axis ticks above
2. WHEN the viewport width is 1024px or narrower, THE Timeline view SHALL display a stacked mobile layout: scenario name on the first line, proportional duration bar on the second line (positioned at left=0, width proportional to duration/slowest)
3. WHEN the viewport is resized between mobile and desktop breakpoints, THE Timeline view SHALL reactively switch layouts without requiring a page reload
4. THE Timeline view SHALL hide the time axis (x-axis ticks) on viewports 1024px or narrower
5. THE mobile layout rows SHALL be 52px tall; the desktop layout rows SHALL be 28px tall

### Requirement 32: Sticky Category Headers in Virtualized Scenario List

**User Story:** As an Engineer, I want category group headers to remain visible while scrolling through a category's scenarios, so that I always know which group I'm looking at.

#### Acceptance Criteria

1. WHEN the Test Scenarios view is sorted by "Category" and the user scrolls within a group, THE Report_Template SHALL display the current group's header pinned to the top of the scroll container
2. THE sticky header SHALL update to reflect the currently visible group as the user scrolls between groups
3. THE sticky header SHALL be hidden when the original group header is still visible in the viewport
4. WHEN the sort mode is changed away from "Category" (e.g. Name, Slowest, Status), THE sticky header SHALL be hidden
5. THE group headers SHALL have consistent spacing: 16px gap above the header (separating from previous group) and 16px gap below the header border (before first scenario in the group), except for the first header which has no top gap

### Requirement 33: Group Header Truncation on Narrow Viewports

**User Story:** As an Engineer viewing the report on a narrow screen, I want long category paths to be truncated from the beginning, so that the most specific (last) segment remains visible.

#### Acceptance Criteria

1. WHEN a group header text overflows its container width, THE Report_Template SHALL truncate from the left (beginning) and display an ellipsis
2. THE last segment of the category path (e.g. "Reports Failing Scenarios" in "Reporting Results › Reports Failing Scenarios") SHALL remain visible when truncation occurs
3. THE full category path SHALL remain visible on viewports wide enough to display it without overflow

### Requirement 34: Dashboard Layout with Right-Side Action Cards

**User Story:** As a Product Owner, I want the dashboard to show actionable information (new failures, unstable tests, slowest tests) in a consistent column alongside the trend chart, so that I can quickly assess what needs attention.

#### Acceptance Criteria

1. THE Dashboard SHALL use a 2-column grid layout: a wider left column containing the Test Results card (with Pass Rate and Total Failed to its right) and the Trend chart below; and a narrower right column containing New Failures, Most Unstable, and Slowest Tests cards stacked vertically
2. THE right column cards SHALL all have the same width (1fr of the 2fr/1fr grid)
3. THE "New Failures" card SHALL show up to 5 scenarios that passed in the previous run but failed in the current run, with a "View all →" link navigating to `/tests?filter=new-failures`
4. WHEN there are no new failures, THE "New Failures" card SHALL display an encouraging message: "Well done! No new failures" with a green checkmark
5. THE "Most Unstable" card SHALL show up to 5 flaky scenarios with their flakiness rate percentage, with a "View all →" link navigating to `/flaky`
6. THE "Slowest Tests" card SHALL show the top 5 slowest scenarios with their durations, with a "View all →" link navigating to `/tests?sort=duration`
7. THE Trend chart SHALL include a Duration dataset (dashed line) plotted against a right y-axis, showing test run duration over time
8. THE right y-axis SHALL display duration values using the `formatDuration` function (handling ms, seconds, minutes, hours)
9. THE Trend chart tooltip SHALL display formatted duration (e.g. "4.2s", "2m 15s") for the Duration dataset, and filled colour boxes for each series in the legend

### Requirement 35: Pending Outcome Icon

**User Story:** As an Engineer, I want outcome icons to render consistently and be well-centered, so that the visual indicators are clear and professional.

#### Acceptance Criteria

1. THE Report_Template SHALL use an en-dash character (–) for the pending outcome icon
2. THE pending icon SHALL be vertically and horizontally centered within its circular container
3. THE outcome icons SHALL use the following characters: ✓ (passed), ✗ (failed), – (pending), ⊘ (skipped), ⚠ (compromised)

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
23. Sort controls (Category, Name, Slowest, Status) change the list order
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

### Test Scenario Detail View

37. Breadcrumb shows "Test Scenarios › Category › Subcategory › Scenario name"
38. Breadcrumb "Test Scenarios" link preserves `?run=N` context
39. Breadcrumb category segments populate search with exact match on click
40. Run selector pills navigate between runs for the same scenario
41. Historical run banner appears with "show latest" link
42. Execution history blocks highlight the currently viewed run with a ring
43. Clicking an execution history block navigates to that run's detail
44. Copy button copies the test source path to clipboard
45. Narrative (feature description) renders as italic blockquote when present
46. Tags display as chips in the detail header
47. Cast section displays actor names and their abilities with details
48. Activity tree renders hierarchically with correct indentation
49. Activity tree shows data tables as HTML tables below steps
50. Activity tree shows docstrings as formatted pre blocks below steps
51. Nested activities (Task containing Interactions) render recursively
52. Retry tabs switch between attempt activity trees
53. Error block shows error name, message, and stack trace
54. Scenario with missing `cast` field does not crash the view
55. Scenario with missing `tags` field does not crash the view
56. Navigating to a non-existent scenario shows "Test scenario not found"

### Tags View

57. Tags are grouped by type (Feature, Issue, Tag, Browser) with section headers
58. Each tag card shows name, scenario count, and colour-coded pass rate with progress bar
59. Clicking a tag card navigates to test scenarios filtered by that tag name
60. Pass rate tooltip shows "Pass rate: X%"
61. Grid layout adapts to viewport width (responsive columns)

### Errors View

62. Errors are grouped by type category (Assertion Errors, Compromised Tests, Timeout Errors, Runtime Errors)
63. Summary cards show count per error category
64. Each error entry shows scenario name, source path, and error message (no stack trace)
65. Clicking an error entry navigates to the scenario detail view
66. Run selector pills allow viewing errors from historical runs
67. Historical run banner appears with "show latest" link

### Requirements View

68. Requirements hierarchy displays as an expandable tree with directories and files
69. Directory nodes expand/collapse on click, files navigate to filtered test scenarios
70. README content renders as styled HTML when a directory node is expanded
71. README bullet lists are properly indented
72. Coverage stats (Coverage %, Pass Rate %, Gaps) display in summary cards
73. Nodes with no tests show "No tests" indicator in red
74. Multiple nesting levels render with correct indentation

### Flaky Tests View

75. Flaky tests are grouped by category with sticky headers
76. Outcome history mini-chart shows pass/fail pattern across runs
77. Flakiness percentage is displayed per test
78. Clicking a flaky test navigates to its scenario detail

### Timeline View

79. Stats cards show slowest, fastest, average, and total run duration
80. Execution order toggle shows Gantt-chart with time axis
81. Slowest first toggle shows bars sorted by duration
82. Clicking a timeline row navigates to the scenario detail
83. Test names are visible in each row alongside the duration bar

### Test Runs View

84. Runs are listed in reverse chronological order (most recent first)
85. Each run shows label, timestamp, duration, pass rate, and scenario count
86. CI link opens in new tab without triggering row navigation
87. CI link has proper contrast in both light and dark modes
88. Clicking a run row navigates to test scenarios for that run

### System Context View

89. Node.js version, test runner, OS, Serenity/JS version are displayed
90. CI/CD section shows provider, build number, branch, commit when available

### Theme & Accessibility

91. Dark mode is detected from OS preference on first load
92. Theme toggle switches between dark and light modes
93. Theme preference persists in localStorage across reloads
94. All text elements have minimum 12px font size (no text smaller than 0.75rem)
95. Breadcrumb links have sufficient contrast in dark mode (#a5a7ff)
96. Tag chips have sufficient contrast in dark mode (--text-primary colour)
97. Font size scale uses CSS custom properties (adjustable from one place)

### Data Loading & Edge Cases

98. Report renders correctly when loaded via `file://` protocol
99. Report renders when `data.js` has no history (empty `history` array)
100. Report renders when `data.js` has no tags (empty `tags` array)
101. Report renders when `data.js` has no requirements (`requirements` is null)
102. Report handles scenarios with missing optional fields (cast, tags, executionHistory, activities) without crashing

### Virtual Scrolling & Performance

103. Timeline view uses virtualized rendering — only visible rows exist in the DOM
104. Test Scenarios list uses virtualized rendering — only visible rows exist in the DOM
105. Scrolling through 100+ scenarios in the list does not create more than ~50 DOM nodes
106. Virtual scroll maintains correct item order after scrolling to bottom and back to top
107. Sticky group header appears when scrolling within a category group
108. Sticky group header updates to show the correct category when crossing group boundaries
109. Sticky group header is hidden when sort mode is not "Category"
110. Group headers have z-index above scenario items (no text overlap)
111. Scenario row height (66px) contains all content without overflow into adjacent items

### Responsive Timeline

112. At viewport >1024px, timeline shows desktop Gantt layout (label | bar | duration)
113. At viewport ≤1024px, timeline shows stacked mobile layout (name + bar below)
114. Resizing from desktop to tablet switches timeline to stacked layout without reload
115. Resizing from tablet to desktop switches timeline to Gantt layout without reload
116. Desktop timeline shows time axis ticks above the Gantt chart
117. Mobile/tablet timeline hides the time axis ticks
118. Mobile timeline bar uses `left: 0` (proportional width, not timeline-offset)

### Group Header Truncation

119. On narrow viewports, long group headers truncate from the left with ellipsis
120. The last segment of a multi-level category path remains visible when truncated
121. On wide viewports, the full category path displays without truncation

### Dashboard Layout

122. Dashboard displays 2-column grid: left (test results + trend) and right (action cards)
123. Right column shows New Failures, Most Unstable, Slowest Tests in that order
124. All right column cards have the same width
125. "New Failures" card shows up to 5 entries with "View all →" link to `/tests?filter=new-failures`
126. "New Failures" card shows "Well done! No new failures" when empty
127. "Most Unstable" card shows up to 5 entries with "View all →" link to `/flaky`
128. "Slowest Tests" card shows top 5 with "View all →" link to `/tests?sort=duration`
129. Clicking a slowest test entry navigates to its scenario detail
130. Clicking a new failure entry navigates to its scenario detail
131. Clicking a most unstable entry navigates to its scenario detail
132. Pass Rate card navigates to `/tests?filter=non-passing` on click
133. Total Failed card navigates to `/tests?filter=failed` on click
134. "Requirements" link in Pass Rate card navigates to `/requirements`
135. Trend chart includes Duration dataset as dashed purple line on right y-axis
136. Trend chart right y-axis labels use formatDuration (handles ms/s/m/h)
137. Trend chart tooltip shows formatted duration for Duration series
138. Trend chart tooltip legend boxes are filled with solid dataset colours

### Pending Icon

139. Pending scenarios show an en-dash (–) icon that is centered in the outcome circle
