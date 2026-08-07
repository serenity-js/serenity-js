# Display Timestamps in User's Local Time Zone

## Status: COMPLETED

Already implemented — `formatTimestamp()` uses `toLocaleDateString()` / `toLocaleTimeString()` with the browser's
default locale and timezone. Tooltips show the raw UTC ISO string as a precise reference for correlating with CI logs.

## Solution

Format all user-facing timestamps using the browser's local time zone. Store timestamps as UTC ISO 8601 strings
(no change to the data model), but render them localised.

## Affected Locations

All calls to `formatTimestamp()` in the app — this is the single formatting function used across:

- Trend chart x-axis labels
- Run selector dropdown entries
- TrendChartDetails module table (startedAt, finishedAt)
- Dashboard meta (run date)
- Scenario detail (startedAt)
- Execution history labels
- RunSelector entries

## Implementation

Update `formatTimestamp()` in `app/utils/format.ts` to use `Intl.DateTimeFormat` with the user's default locale
and time zone:

```typescript
export function formatTimestamp(iso: string): string {
    const date = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
```

`undefined` as the locale uses the browser's default (respecting OS language settings).
The time zone is automatically the user's local zone.

## Considerations

- **Consistency**: all timestamps in the report should use the same formatting — don't mix UTC and local
- **Tooltip**: for precise times, consider adding a `title` attribute with the full ISO string on hover
- **Abbreviation**: `abbreviateRunLabels()` uses timestamps for mobile labels — ensure it also localises
- **Date grouping**: execution history groups by date — ensure grouping uses local dates, not UTC dates
- **Edge case**: midnight boundary — a run at 23:50 UTC might be "next day" in UTC+2; grouping should
  use the user's local date

## Testing

- Component test: verify `formatTimestamp` outputs in local time (mock `Intl.DateTimeFormat` or compare against `new Date().toLocaleString()`)
- Visual verification: check that trend chart labels, run selector, and module table show local times

## Backwards Compatibility

No data model changes. Pure rendering change. The stored ISO strings remain UTC.
