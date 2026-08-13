# Manual Verification Checklist: Module Tagging & Navigation

**Report URL:** http://localhost:8080  
**Date:** 2026-07-27  
**Features:**
- Module tagging (`@module:` search filter)
- Interactive module table in TrendChartDetails
- Sticky table headers and first column

---

## Pre-Flight Check

- [ ] Server is running on http://localhost:8080
- [ ] Report opens successfully in browser
- [ ] Dashboard view loads without errors
- [ ] Console shows no JavaScript errors (F12 → Console tab)

---

## 1. Module Tagging — Search & Filter

### 1.1 Test Scenarios View Search

**Steps:**
1. Navigate to **Test Scenarios** view (sidebar)
2. In the search input, type: `@module:`

**Expected:**
- [ ] No errors occur
- [ ] Search suggestions may appear (depending on implementation)

**Steps:**
3. Complete the search: `@module:html-reporter` (or another module name from your build)

**Expected:**
- [ ] Scenarios list filters to show only tests from that module
- [ ] Result count updates to show filtered count
- [ ] URL updates to include `search=@module:html-reporter`
- [ ] If no scenarios match, "No scenarios found" message appears

**Verify:**
- [ ] Browser back button returns to unfiltered view
- [ ] Browser forward button re-applies the filter
- [ ] Refreshing the page (F5) maintains the filter state

### 1.2 Tags View

**Steps:**
1. Navigate to **Tags** view (sidebar)
2. Scroll through tag groups

**Expected:**
- [ ] A "module" tag group appears in the list
- [ ] Each module shows with its pass rate and scenario count
- [ ] Module tag cards show the module name

**Steps:**
3. Click on a module tag card

**Expected:**
- [ ] Navigates to Test Scenarios view
- [ ] URL contains `search=@module:<name>`
- [ ] Scenarios are filtered to that module

### 1.3 Combined Filters

**Steps:**
1. Navigate to Test Scenarios view
2. Search for `@module:html-reporter`
3. Click the **Failed** filter chip

**Expected:**
- [ ] Scenarios filtered to failed tests from html-reporter module
- [ ] URL contains both `search=@module:html-reporter` and `filter=failed`
- [ ] Result count is accurate
- [ ] Only failed scenarios from that module are visible

**Steps:**
4. Clear the search (click X or delete text)

**Expected:**
- [ ] Filter chip remains active (still showing all failed scenarios)
- [ ] Module filter is removed
- [ ] URL updates accordingly

---

## 2. Trend Chart Module Table — Desktop View

### 2.1 Navigation to Module Table

**Steps:**
1. Navigate to **Test Runs** view (sidebar)
2. Ensure the trend chart is visible
3. Click on any bar in the trend chart

**Expected:**
- [ ] Details panel slides in from the right
- [ ] Panel shows run ID and timestamp
- [ ] If the run has multiple modules, a table appears
- [ ] If the run has only one module, metric cards appear instead

**Note:** The example data may only have a single module. If so, document this and skip to Section 2.6.

### 2.2 Module Table Structure

**Expected visible columns:**
- [ ] Module (left-most)
- [ ] Outcome
- [ ] Tests (total count)
- [ ] Passed
- [ ] Failed
- [ ] Skipped
- [ ] Started (timestamp)
- [ ] Duration

**Expected rows:**
- [ ] One row per module
- [ ] Totals row at the bottom

### 2.3 Interactive Module Names

**Steps:**
1. Hover over a module name in the first column

**Expected:**
- [ ] Cursor changes to pointer
- [ ] Module name underlines on hover
- [ ] Color remains consistent with row outcome color

**Steps:**
2. Click a module name

**Expected:**
- [ ] Navigates to Test Scenarios view
- [ ] URL is `/tests?run=<runId>&search=@module:<moduleName>`
- [ ] Scenarios are filtered to that module
- [ ] RunSelector shows the correct historical run
- [ ] Search input shows `@module:<moduleName>`

**Verify:**
3. Click browser back button

**Expected:**
- [ ] Returns to Test Runs view with details panel still open

### 2.4 Interactive Count Buttons

**Steps:**
1. Hover over the "Passed" count for a module

**Expected:**
- [ ] Cursor changes to pointer
- [ ] Count underlines on hover

**Steps:**
2. Click the "Passed" count

**Expected:**
- [ ] Navigates to Test Scenarios view
- [ ] URL is `/tests?run=<runId>&search=@module:<moduleName>&filter=passed`
- [ ] Only passed scenarios from that module are visible
- [ ] FilterBar shows "Passed" chip as active
- [ ] Search input shows `@module:<moduleName>`

**Steps:**
3. Return to Test Runs view → Click "Failed" count for a module

**Expected:**
- [ ] Navigates with `filter=failed` in URL
- [ ] Only failed scenarios from that module are visible
- [ ] FilterBar shows "Failed" chip as active

**Steps:**
4. Return to Test Runs view → Click "Skipped" count for a module

**Expected:**
- [ ] Navigates with `filter=skipped` in URL
- [ ] Only skipped/pending scenarios from that module are visible
- [ ] FilterBar shows "Skipped" chip as active

### 2.5 Incomplete Module Rows

**Note:** The example data includes an incomplete run. Navigate to it.

**Steps:**
1. Click the bar for the incomplete run (should have ⚠️ indicator)
2. Inspect module rows with `outcome = 'incomplete'`

**Expected:**
- [ ] Counts show `—` instead of numbers
- [ ] Module name is still clickable (underlines on hover)
- [ ] Count cells show plain text (no underline on hover, no pointer cursor)

**Steps:**
3. Click an incomplete module's name

**Expected:**
- [ ] Navigates to Test Scenarios view with module filter
- [ ] Shows whatever scenarios were captured before the crash

### 2.6 "Show test scenarios →" Button

**Steps:**
1. Open any run's details panel
2. Scroll to the bottom
3. Click "Show test scenarios →"

**Expected:**
- [ ] Navigates to Test Scenarios view
- [ ] URL is `/tests?run=<runId>` (no search or filter)
- [ ] All scenarios from that run are visible
- [ ] No filters are active

---

## 3. Sticky Table Headers — Desktop Scroll

**Prerequisites:** This section requires a run with 10+ modules. If example data has fewer, document and skip.

### 3.1 Vertical Scroll

**Steps:**
1. Open a run's details panel with the module table
2. Scroll down through the module rows (inside the panel)

**Expected:**
- [ ] Header row (Module, Outcome, Tests...) remains fixed at the top of the table
- [ ] Header does not scroll out of view
- [ ] Header has an opaque background (not transparent)
- [ ] Header has a subtle shadow beneath it

**Visual check:**
- [ ] No gap between header and scrolling content
- [ ] Header text remains aligned with column content

### 3.2 Horizontal Scroll (Narrow Window)

**Steps:**
1. Resize browser window to ~900px wide (or use DevTools responsive mode)
2. Open a run's details panel
3. Scroll horizontally within the table (if table is wider than viewport)

**Expected:**
- [ ] First column (Module names) remains fixed on the left
- [ ] First column does not scroll out of view horizontally
- [ ] First column has an opaque background
- [ ] First column has a subtle shadow to its right

**Visual check:**
- [ ] Module names remain visible when scrolling right
- [ ] No text overlap between sticky column and scrolling columns

### 3.3 Header-Column Intersection

**Steps:**
1. Scroll both vertically and horizontally
2. Observe the top-left cell (header "Module")

**Expected:**
- [ ] The "Module" header cell remains visible in both dimensions
- [ ] It appears above both the sticky header row and the sticky first column
- [ ] No z-index fighting (no flickering or visual glitches)

---

## 4. Mobile Responsiveness — iOS Safari

**Prerequisites:** iPhone or iPad (or desktop DevTools mobile emulation)

### 4.1 Basic Navigation

**Steps:**
1. Open http://localhost:8080 on mobile device
2. Navigate to Test Runs view
3. Tap a chart bar

**Expected:**
- [ ] Details panel appears as a full-screen modal (not side panel)
- [ ] Panel overlays the entire viewport
- [ ] Close button (✕) is visible and tappable
- [ ] Module table is readable (text not too small)

### 4.2 Module Table Scrolling

**Steps:**
1. Scroll vertically through modules

**Expected:**
- [ ] Header row stays at top of screen
- [ ] Body scroll does not move the page (only table content scrolls)
- [ ] No Safari address bar collapse issues

**Steps:**
2. Scroll horizontally (if table is wide)

**Expected:**
- [ ] Module column stays on left
- [ ] Scrolling is smooth (no janky performance)

### 4.3 Touch Targets

**Steps:**
1. Tap a module name

**Expected:**
- [ ] Link activates on tap (no delay)
- [ ] Navigates correctly
- [ ] No accidental tap on adjacent cells

**Steps:**
2. Return → Tap a count button

**Expected:**
- [ ] Button activates on tap
- [ ] Navigation works correctly
- [ ] Large enough target (minimum 44×44 CSS pixels)

---

## 5. Keyboard Navigation & Accessibility

### 5.1 Tab Navigation

**Steps:**
1. Open a run's details panel with module table
2. Press Tab repeatedly

**Expected:**
- [ ] Focus moves through module name links
- [ ] Focus moves through count buttons
- [ ] Focus indicators are clearly visible (outline visible on each element)
- [ ] Tab order follows visual layout (left-to-right, top-to-bottom)
- [ ] Totals row is skipped (non-interactive)

### 5.2 Keyboard Activation

**Steps:**
1. Tab to a module name link
2. Press Enter

**Expected:**
- [ ] Link activates (navigates to filtered view)
- [ ] Same behaviour as clicking with mouse

**Steps:**
3. Return → Tab to a count button
4. Press Space

**Expected:**
- [ ] Button activates (navigates to filtered view)
- [ ] Same behaviour as clicking with mouse

### 5.3 Screen Reader (Optional)

**Tools:** VoiceOver (Mac), NVDA (Windows), TalkBack (Android)

**Steps:**
1. Navigate to module table with screen reader
2. Navigate through module name links

**Expected:**
- [ ] Link announces: "module-name, link"
- [ ] Count buttons announce their ARIA label: "View X passed tests from module-name, button"

---

## 6. Dark Theme Compatibility

### 6.1 Toggle Dark Theme

**Steps:**
1. In the report sidebar footer, toggle dark theme
2. Inspect the module table

**Expected:**
- [ ] Sticky header has opaque dark background (not transparent)
- [ ] Sticky first column has opaque dark background
- [ ] Shadows are visible against dark background
- [ ] Module name links are readable (sufficient contrast)
- [ ] Count buttons are readable
- [ ] Focus indicators visible in dark theme

**Steps:**
3. Hover over interactive elements in dark theme

**Expected:**
- [ ] Underline appears on hover
- [ ] Colors remain consistent with outcome badges

---

## 7. Edge Cases & Error Conditions

### 7.1 Empty Module Name

**Check:** Do any modules have empty or whitespace-only names?

**Expected:**
- [ ] If yes, they display as fallback text (not blank)
- [ ] Navigation still works

### 7.2 Very Long Module Names

**Check:** Artificially add a module with a very long name (if possible)

**Expected:**
- [ ] Text wraps or truncates gracefully
- [ ] Does not break table layout
- [ ] Sticky column still works

### 7.3 Zero Counts

**Steps:**
1. Find a module with 0 passed tests

**Expected:**
- [ ] "0" displays in the Passed column
- [ ] Button is still clickable (though results will be empty)
- [ ] Clicking navigates but shows "No scenarios found"

### 7.4 Network Delay Simulation (Optional)

**Steps:**
1. Open DevTools → Network tab
2. Throttle to "Slow 3G"
3. Navigate using module table links

**Expected:**
- [ ] Clicks register immediately (no double-tap confusion)
- [ ] Navigation happens after page load completes
- [ ] No JavaScript errors during slow navigation

---

## 8. Cross-Browser Testing

### 8.1 Chrome/Edge (Chromium)
- [ ] All features work as expected
- [ ] Sticky positioning renders correctly
- [ ] Navigation flows work
- [ ] No console errors

### 8.2 Safari (macOS)
- [ ] Sticky positioning works (no clipping)
- [ ] Focus indicators visible
- [ ] Navigation works
- [ ] No console errors

### 8.3 Firefox
- [ ] Sticky positioning works
- [ ] Interactive elements respond correctly
- [ ] Focus indicators visible
- [ ] No console errors

### 8.4 Mobile Safari (iOS)
- [ ] Sticky positioning works
- [ ] Touch targets large enough
- [ ] No address bar clipping issues
- [ ] Scrolling is smooth

---

## Issues Found

**Use this section to document any issues discovered during manual testing:**

### Issue 1:
- **Description:** 
- **Steps to reproduce:**
- **Expected behaviour:**
- **Actual behaviour:**
- **Screenshot/screen recording:** (if applicable)
- **Browser/device:**

### Issue 2:
- **Description:** 
- **Steps to reproduce:**
- **Expected behaviour:**
- **Actual behaviour:**
- **Screenshot/screen recording:** (if applicable)
- **Browser/device:**

---

## Sign-Off

- [ ] All critical tests pass (sections 1-3)
- [ ] All important tests pass (sections 4-6)
- [ ] Edge cases handled gracefully (section 7)
- [ ] Tested on at least 2 browsers (section 8)
- [ ] No blocking issues found
- [ ] Feature is ready for production

**Verified by:** _________________  
**Date:** _________________  
**Notes:**
