# Documentation Standards

Standards and conventions for writing and publishing documentation on the Serenity/JS website (serenity-js.org).

## Workflow

### All changes via PR with manual review

Documentation changes must be made on a **new branch** and incorporated via **pull request**. Every PR requires manual review before merging — no direct pushes to `main` for content changes (except trivial fixes like typos or broken links).

This ensures:
- Factual accuracy is verified before publication
- Broken links are caught by CI
- Rendered output is reviewed (dev server rendering may differ from production)
- Content quality remains consistent

### Verify on the deployed site, not just dev server

The local Docusaurus dev server may render DynamicCodeBlock indentation and other components differently from the production build. Always confirm rendering on the deployed site after merge.

---

## Docusaurus Components

### DynamicCodeBlock

Use `DynamicCodeBlock` when you need to interpolate dynamic values (e.g., `<PlaywrightVersion />`) into code examples. For static code, use regular fenced code blocks.

**Backslash escaping:** Inside a `DynamicCodeBlock` template literal (`{\`...\``}`), a single `\` is interpreted as an escape character. Use `\\` to produce a literal `\` in the rendered output. This affects:
- YAML multi-line commands (`\` line continuations)
- Groovy `sh """..."""` blocks
- Any other context where a literal backslash is needed

**Indentation:** The component may strip leading whitespace. Follow the indentation pattern established by existing working examples on `main`. When in doubt, check how a similar block renders on the deployed site.

### PlaywrightVersion

All Docker image references must use the `<PlaywrightVersion />` component for dynamic version resolution:

```jsx
image: ghcr.io/serenity-js/playwright:v`}<PlaywrightVersion />{`-resolute
```

Never hardcode version numbers like `v1.62.1`. The component reads the version from the site's dependencies automatically.

Requires the export at the top of the MDX file:
```jsx
export const PlaywrightVersion = () => <SupportedIntegrationVersion name="playwright-core" format="exact" />;
```

### Figure

Use the `<Figure>` component for all images that need a caption. Never use bare markdown `![alt](url)` for screenshots — they render without context.

```jsx
<Figure
    caption='Description of what the image shows'
    img={require('@site/static/images/path/to/image.png')}
    externalLink={'https://link-to-live-example/'}
/>
```

### npm2yarn

Use `npm2yarn` for all install/uninstall commands so users see npm/yarn/pnpm tabs:

````markdown
```sh npm2yarn
npm install --save-dev @serenity-js/html-reporter
```
````

---

## Content Conventions

### Callouts (admonitions)

- Never place two callouts immediately adjacent to each other — move one to a more relevant location, combine them, or separate with prose
- Use `:::tip` for recommendations and best practices
- Use `:::note` for supplementary context that isn't essential
- Use `:::info` for prerequisites or setup requirements
- Use `:::warning` for things that can cause data loss or broken builds

### Describing reporters

| Reporter | How to describe it |
|----------|-------------------|
| **HTML Reporter** | Self-contained report with trend history, flaky test detection, error clustering, and an interactive dashboard. No Java required. |
| **Serenity BDD Reporter** | Multi-page HTML reports with narrative documentation. Requires Java. |

When framing the choice: "If your team already uses Serenity BDD or prefers its multi-page report format"

Never use "requirements-based living documentation" — it's meaningless jargon.

### Linking

- Link to API docs using relative paths: `/api/html-reporter/interface/HtmlReporterConfig/`
- Link to handbook pages using relative paths: `/handbook/reporting/html-reporter/`
- External links use full URLs
- When mentioning a config option, link to its API docs page
- When mentioning a CI provider, link to the provider-specific guide

### Headings

- `##` for major sections
- `###` for subsections
- Use sentence case, not title case: "Preserving trend history" not "Preserving Trend History"
- Headings should be scannable on their own (a reader should understand the page structure from the TOC)

### Code examples

- Always include a `title` on fenced code blocks: `` ```ts title="playwright.config.ts" ``
- Show the relationship between config values (e.g., `specDirectory` matching `testDir`)
- Add inline comments sparingly — only where the intent isn't obvious from the code itself
- Use realistic values, not `foo`/`bar`

---

## Style

- Direct, concise prose — respect the reader's time
- Lead with outcome, then steps, then explanation
- Active voice over passive
- "You" to address the reader directly
- No marketing superlatives ("simply", "just", "easy", "powerful")
- Bold for key terms on first introduction only
- Use tables for reference material, bullets for steps/lists, prose for explanation
