# Code Duplication Refactoring Specification

## Problem

After completing the URL building refactor, several utility functions remain duplicated across client (`app/`) and server (`src/cli/`) code:

1. **`tagDiscriminator()`** — exists in both `sceneIdentity.ts` and `navigation.ts`
2. **Path stripping** — 3 different implementations with similar purposes
3. **Tag extraction** — `getBrowserTag()` could be generalized

## Analysis

### 1. tagDiscriminator() Duplication

**Server-side (authoritative):**
```typescript
// src/cli/model/sceneIdentity.ts
export function tagDiscriminator(tags: TagRecord[]): string {
    const browserTag = tags.find(t => t.type === 'browser')?.name || '';
    const projectTag = tags.find(t => t.type === 'project')?.name || '';
    const platformTag = tags.find(t => t.type === 'platform')?.name || '';
    return [browserTag, projectTag, platformTag].filter(Boolean).join('@');
}
```

**Client-side (duplicate):**
```typescript
// app/utils/navigation.ts
export function tagDiscriminator(tags?: ReportScenarioTag[]): string {
    if (!tags) return '';
    const browserTag = tags.find(t => t.type === 'browser')?.name || '';
    const projectTag = tags.find(t => t.type === 'project')?.name || '';
    const platformTag = tags.find(t => t.type === 'platform')?.name || '';
    return [browserTag, projectTag, platformTag].filter(Boolean).join('@');
}
```

**Issue:** Identical logic, but different type signatures:
- Server accepts `TagRecord[]` (required)
- Client accepts `ReportScenarioTag[] | undefined` (optional)

### 2. Path Stripping Implementations

**a) navigation.ts (middleware approach):**
```typescript
function stripAbsolutePrefix(filePath: string, specDirectory?: string): string {
    if (!specDirectory) return filePath;
    const marker = '/' + specDirectory + '/';
    const index = filePath.indexOf(marker);
    if (index !== -1) {
        return filePath.slice(index + marker.length);
    }
    return filePath;
}

export function relativeSourcePath(scenario: { source: ReportSource; name: string }, specDirectory?: string): string {
    const relativePath = stripAbsolutePrefix(scenario.source.path, specDirectory);
    return scenario.source.line ? relativePath + ':' + scenario.source.line : relativePath;
}
```

**b) formatSource.ts (prefix stripping):**
```typescript
export function formatSource(source: { path: string; line?: number }, specDirectory?: string): string {
    let path = source.path;
    if (specDirectory) {
        const prefix = specDirectory.endsWith('/') ? specDirectory : specDirectory + '/';
        if (path.startsWith(prefix)) {
            path = path.slice(prefix.length);
        }
    }
    if (source.line !== undefined) {
        return `${ path }:${ source.line }`;
    }
    return path;
}
```

**c) formatError.ts (pattern-based):**
```typescript
export function stripAbsolutePaths(text: string, specDirectory?: string): string {
    if (!specDirectory) return text;
    // Uses regex to strip paths from error messages
    const regex = new RegExp(`\\S+?/${specDirectory}/([^:\\s]+)`, 'g');
    return text.replace(regex, '$1');
}
```

**Issue:** Three different algorithms for similar goals (stripping spec directory prefix from paths).

### 3. Browser Tag Extraction

```typescript
export function getBrowserTag(scenario: { tags?: Array<{ type: string; name: string }> }): string | null {
    const tag = (scenario.tags || []).find(t => t.type === 'browser');
    return tag ? tag.name : null;
}
```

**Issue:** Specific to browser tags, but could be generalized to `getTagByType(scenario, 'browser')`.

## Solution

### Strategy 1: Consolidate tagDiscriminator (Recommended)

**Keep server-side as source of truth**, re-export for client:

```typescript
// src/cli/model/sceneIdentity.ts (unchanged)
export function tagDiscriminator(tags: TagRecord[]): string { ... }

// app/utils/navigation.ts (delegate)
import { tagDiscriminator as serverTagDiscriminator } from '../../src/cli/model/sceneIdentity.js';

export function tagDiscriminator(tags?: ReportScenarioTag[]): string {
    if (!tags) return '';
    return serverTagDiscriminator(tags);
}
```

**Alternative:** Move to shared location accessible by both (but `src/cli/model/` types are already imported by client).

### Strategy 2: Path Stripping Consolidation

**Option A:** Keep separate (they serve different purposes)
- `stripAbsolutePrefix` — used for UI display (middleware pattern)
- `formatSource` — used for data serialization (prefix pattern)
- `stripAbsolutePaths` — used for error message cleanup (regex pattern)

**Option B:** Create one canonical implementation in `src/cli/` and client delegates

**Recommendation:** Option A — they have different use cases and behaviors. Document each clearly.

### Strategy 3: Generalize getBrowserTag

Replace:
```typescript
export function getBrowserTag(scenario: { tags?: Array<{ type: string; name: string }> }): string | null
```

With:
```typescript
export function getTagByType(scenario: { tags?: Array<{ type: string; name: string }> }, type: string): string | null {
    const tag = (scenario.tags || []).find(t => t.type === type);
    return tag ? tag.name : null;
}

export function getBrowserTag(scenario: { tags?: Array<{ type: string; name: string }> }): string | null {
    return getTagByType(scenario, 'browser');
}
```

## Implementation Plan

### Phase A: Eliminate tagDiscriminator Duplication

1. Update `app/utils/navigation.ts` to delegate to server-side implementation
2. Verify all client-side usages still work
3. Run tests

### Phase B: Generalize Tag Extraction (Optional)

1. Add `getTagByType()` to `navigation.ts`
2. Refactor `getBrowserTag()` to use it
3. Run tests

### Phase C: Document Path Stripping Differences

Add JSDoc explaining when to use which:
- `stripAbsolutePrefix` — for display paths (searches for marker)
- `formatSource` — for serialization (prefix-based)
- `stripAbsolutePaths` — for error messages (regex-based)

## Success Criteria

- [ ] Zero duplicate `tagDiscriminator` implementations
- [ ] Path stripping functions documented with clear use cases
- [ ] All tests passing
- [ ] No behavior changes (pure refactor)
