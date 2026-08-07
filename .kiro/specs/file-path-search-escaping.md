# File Path Search Query Escaping

## Problem

CapabilityDetail.ts builds search queries for file paths like this:

```typescript
search: '"' + filePath + '"'
```

**Issue:** If `filePath` contains a double quote character (`"`), the search query breaks because it produces an unmatched quote.

Example:
- Input: `test"file.spec.ts`
- Output: `"test"file.spec.ts"` ← broken (unmatched quotes)

## Analysis

### How Rare Is This?

File paths with literal quote characters are **extremely rare**:
- Most modern filesystems allow them but discourage their use
- Build tools, test runners, and IDEs often have issues with them
- Real-world projects almost never use quotes in filenames

### Current Search Behavior

The `parseSearchTokens()` function in `tag-search.ts` uses regex:
```typescript
const regex = /@[^:\s]+:"[^"]*"|@\S+|"[^"]+"|(\S+)/g;
```

The pattern `"[^"]+"` expects well-formed quoted strings. An unmatched quote would cause unpredictable behavior.

### Risk Assessment

**Likelihood:** Very low (quotes in filenames are rare)  
**Impact:** Medium (search would fail for that specific file)  
**User workaround:** Remove the quotes from the filename or search without quotes

## Solutions

### Option 1: Escape Quotes (Proper Fix)

```typescript
function escapeSearchQuery(value: string): string {
    return '"' + value.replace(/"/g, '\\"') + '"';
}

// Usage
search: escapeSearchQuery(filePath)
```

**Pros:**
- Handles all edge cases correctly
- Follows standard string escaping conventions

**Cons:**
- Requires updating `parseSearchTokens()` to handle escaped quotes
- Adds complexity for an extremely rare case

### Option 2: Use Template Literals (Minimal Change)

```typescript
search: `"${filePath}"`
```

**Pros:**
- Cleaner, more modern syntax
- No behavior change

**Cons:**
- Doesn't fix the quote problem (still breaks with `"` in filename)

### Option 3: Don't Quote (Alternative Approach)

```typescript
search: filePath  // No quotes
```

**Pros:**
- Simpler
- No escaping needed

**Cons:**
- File paths with spaces would match partially (e.g., `foo bar.spec.ts` would match scenarios containing either "foo" or "bar")
- Less precise matching

## Recommendation

**Short term (this refactor):**
- Use template literals for readability: `search: `"${filePath}"`
- Add a comment noting the limitation
- This matches the existing pattern used in ScenarioDetailView.ts

**Long term (future enhancement):**
- Add proper quote escaping if/when it becomes a real problem
- Add test coverage for special characters in file paths (quotes, spaces, etc.)
- Update `parseSearchTokens()` to handle escaped quotes

## Rationale

1. **File paths with quotes are extremely rare** — this is not a practical issue users encounter
2. **The refactor is already large** — adding quote escaping increases scope and risk
3. **Template literals improve readability** — this is a clear win with zero risk
4. **The limitation is documented** — future developers know to address it if needed

## Implementation

Update CapabilityDetail.ts:

```typescript
// Before
search: '"' + filePath + '"'

// After
search: `"${filePath}"`  // Note: breaks if filePath contains unescaped quotes (extremely rare)
```

Update ScenarioDetailView.ts (same pattern):

```typescript
// Before
search: '"' + segment + '"'

// After  
search: `"${segment}"`  // Note: breaks if segment contains unescaped quotes (extremely rare)
```

## Test Coverage

Add a test case to document the known limitation:

```typescript
// link.spec.ts
test('file path search with quotes (known limitation)', () => {
    // This is a known edge case — file paths with literal quote characters
    // are extremely rare and not currently escaped
    const url = link({ view: 'tests', search: '"test"file.spec.ts"' });
    expect(url).toContain('search=');
    // The quote is encoded by URLSearchParams but the search parser may not handle it correctly
});
```
