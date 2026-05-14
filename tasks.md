# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a single-page, client-side expense tracker using plain HTML, CSS, and Vanilla JavaScript. The app records transactions, displays a running balance, renders a scrollable transaction history, and visualizes spending by category with a Chart.js pie chart — all persisted in Local Storage. Implementation follows the dependency order: HTML structure → CSS styling → JavaScript logic sections.

## Tasks

- [x] 1. Create HTML structure (`index.html`)
  - Create `index.html` at the project root with standard HTML5 boilerplate (`<!DOCTYPE html>`, `<meta charset>`, `<meta name="viewport">`)
  - Add `<link>` tag referencing `css/styles.css`
  - Add Chart.js CDN `<script>` tag (`https://cdn.jsdelivr.net/npm/chart.js`) **before** `js/app.js`
  - Add `<script src="js/app.js" defer>` tag
  - Create the top bar section: app title heading and a balance display element with `id="balance-display"`
  - Create the middle two-column row:
    - Left column: `<form id="expense-form">` containing `<input type="text" id="input-name">`, `<input type="number" id="input-amount">`, `<select id="input-category">` with options Food / Transport / Fun, a submit `<button>`, and a `<p id="form-error">` for inline validation messages
    - Right column: `<canvas id="expense-chart">`
  - Create the bottom section: `<ul id="transaction-list">` for the scrollable transaction history
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1, 6.2, 6.3, 6.5_

- [x] 2. Create CSS stylesheet (`css/styles.css`)
  - [x] 2.1 Set up base styles and typography
    - Create `css/styles.css`
    - Apply CSS reset / box-sizing, set a clean sans-serif font stack, and define a neutral background and text color palette
    - Style the top bar: full-width, visually distinct background, balance displayed prominently
    - _Requirements: 7.3_

  - [x] 2.2 Implement two-column layout and responsive breakpoint
    - Use CSS Flexbox or Grid for the middle row (form left, chart right) on desktop (≥ 600 px)
    - Add a `@media (max-width: 600px)` breakpoint that collapses the two columns into a single stacked column
    - _Requirements: 7.4_

  - [x] 2.3 Style the input form
    - Style form labels, text/number inputs, the category `<select>`, and the submit button for clear visual hierarchy
    - Style `#form-error` in a visible error color (e.g., red); hide it by default with `display: none` (toggled by JS)
    - _Requirements: 1.1, 7.3_

  - [x] 2.4 Style the transaction list
    - Set a `max-height` on `#transaction-list` and apply `overflow-y: auto` so it scrolls when content overflows
    - Style each `<li>` to display name, amount, category, and delete button in a single readable row
    - Style the `.empty-state` placeholder item with muted/italic text
    - _Requirements: 2.1, 2.2, 2.4, 7.3_

  - [x] 2.5 Style the chart container
    - Constrain the `<canvas>` container width so the pie chart renders at a reasonable size on both desktop and mobile
    - _Requirements: 4.1, 7.4_

- [ ] 3. Implement state management and Local Storage (`js/app.js` — STATE & STORAGE sections)
  - Create `js/app.js` with the section comment headers as defined in the design (`STATE`, `STORAGE`, `VALIDATION`, `TRANSACTIONS`, `RENDER`, `CHART`, `EVENT WIRING`, `INIT`)
  - Declare the module-level `transactions` array and the `STORAGE_KEY = "expense_transactions"` constant
  - Implement `saveToStorage(transactions)`: serializes the array to JSON and writes it to `localStorage`
  - Implement `loadFromStorage()`: reads and parses the JSON from `localStorage`; returns `[]` and calls `showStorageWarning()` if the key is absent, the value is not a valid JSON array, or `localStorage` throws (wraps in `try/catch`)
  - Implement `showStorageWarning()`: inserts or reveals a warning banner in the DOM
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 3.1 Write property test for storage round-trip (Property 7)
    - **Property 7: Storage round-trip preserves transaction data**
    - For any valid array of Transaction objects, `saveToStorage` followed by `loadFromStorage` should return an array deeply equal to the original
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 4. Implement form validation (`js/app.js` — VALIDATION section)
  - Implement `validateForm(name, amount)`: returns an array of error strings
    - Pushes `"Item Name is required."` if `name` is empty or whitespace-only
    - Pushes `"Amount is required."` if `amount` is empty
    - Pushes `"Amount must be a positive number."` if `amount` is non-numeric or ≤ 0
    - Returns an empty array when all inputs are valid
  - Implement `showFormError(messages)`: joins error strings and sets `#form-error` text content, makes it visible
  - Implement `clearFormError()`: clears `#form-error` text and hides it
  - _Requirements: 1.3, 1.4_

  - [ ] 4.1 Write property test for whitespace name rejection (Property 3)
    - **Property 3: Whitespace and empty names are rejected**
    - For any string composed entirely of whitespace (or the empty string), `validateForm` should return a non-empty errors array
    - **Validates: Requirements 1.3**

  - [ ] 4.2 Write property test for non-positive amount rejection (Property 4)
    - **Property 4: Non-positive amounts are rejected**
    - For any numeric value ≤ 0 or any non-numeric string, `validateForm` should return a non-empty errors array
    - **Validates: Requirements 1.4**

- [ ] 5. Implement transaction add and delete logic (`js/app.js` — TRANSACTIONS section)
  - Implement `addTransaction(name, amount, category)`:
    - Creates a Transaction object with a unique `id` (`crypto.randomUUID()` with `Date.now().toString()` fallback), trimmed `name`, parsed `amount`, and `category`
    - Pushes it onto the `transactions` array
    - Calls `saveToStorage` then `renderAll`
  - Implement `deleteTransaction(id)`:
    - Filters the `transactions` array to remove the entry with the matching `id`
    - Calls `saveToStorage` then `renderAll`
  - Implement `formatCurrency(amount)`: returns a formatted string (e.g., `"Rp 25.000"`) for display
  - _Requirements: 1.2, 1.5, 2.3, 5.1, 5.2_

  - [ ] 5.1 Write property test for transaction addition round-trip (Property 1)
    - **Property 1: Transaction addition round-trip**
    - For any valid transaction (non-empty name, positive amount, valid category), after `addTransaction` is called, `loadFromStorage` should return an array containing a transaction with the same name, amount, and category
    - **Validates: Requirements 5.1, 5.3**

  - [ ] 5.2 Write property test for delete removes exactly one (Property 5)
    - **Property 5: Delete removes exactly one transaction**
    - For any transaction list and any ID present in it, calling `deleteTransaction(id)` should produce a list exactly one element shorter with no entry matching that ID
    - **Validates: Requirements 2.3, 5.2**

- [ ] 6. Implement render functions (`js/app.js` — RENDER section)
  - [ ] 6.1 Implement `renderBalance(transactions)`
    - Computes `total` as the sum of all `t.amount` values (0 when array is empty)
    - Sets `document.getElementById("balance-display").textContent` to `formatCurrency(total)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 6.2 Write property test for balance equals sum of amounts (Property 2)
    - **Property 2: Balance equals sum of amounts**
    - For any array of transactions, the value computed by `renderBalance` should equal the arithmetic sum of all `amount` fields
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [ ] 6.3 Implement `renderTransactionList(transactions)`
    - Clears `#transaction-list` inner HTML
    - If the array is empty, inserts `<li class="empty-state">No expenses recorded yet.</li>`
    - Otherwise, maps each transaction to an `<li data-id="<id>">` containing `.tx-name`, `.tx-amount`, `.tx-category` spans and a `<button class="btn-delete" data-id="<id>">×</button>`
    - _Requirements: 2.1, 2.4_

  - [ ] 6.4 Implement `renderAll()`
    - Calls `renderTransactionList(transactions)`, `renderBalance(transactions)`, and `updateChart(transactions)` in sequence
    - _Requirements: 3.2, 3.3, 4.2, 4.3_

- [ ] 7. Checkpoint — Core logic complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement Chart.js pie chart (`js/app.js` — CHART section)
  - [ ] 8.1 Implement `initChart()`
    - Declares module-level `let chartInstance = null`
    - Gets the 2D context from `document.getElementById("expense-chart")`
    - Creates a `new Chart(ctx, { type: "pie", ... })` with labels `["Food", "Transport", "Fun"]`, initial neutral data `[1, 1, 1]`, all-grey background colors `["#e0e0e0", "#e0e0e0", "#e0e0e0"]`, `responsive: true`, legend at bottom, tooltips enabled
    - Assigns the instance to `chartInstance`
    - _Requirements: 4.1, 6.5_

  - [ ] 8.2 Implement `updateChart(transactions)`
    - Computes `totals = { Food: 0, Transport: 0, Fun: 0 }` by summing amounts per category
    - If all totals are zero, sets data to `[1, 1, 1]` and background to all-grey (neutral empty state)
    - Otherwise, sets data to `[totals.Food, totals.Transport, totals.Fun]` and background to `["#FF6384", "#36A2EB", "#FFCE56"]`
    - Calls `chartInstance.update()` to animate the transition
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 8.3 Write property test for chart category totals (Property 6)
    - **Property 6: Chart category totals match transaction data**
    - For any array of transactions, the data values computed for each category by `updateChart` should equal the sum of amounts of all transactions in that category
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 9. Wire events and initialize the app (`js/app.js` — EVENT WIRING & INIT sections)
  - Implement the `submit` event listener on `#expense-form`:
    - Calls `event.preventDefault()`
    - Reads values from `#input-name`, `#input-amount`, `#input-category`
    - Calls `validateForm`; if errors exist, calls `showFormError` and returns early
    - Otherwise calls `clearFormError`, `addTransaction`, and resets the form with `form.reset()`
  - Implement delegated `click` event listener on `#transaction-list`:
    - Checks if `event.target` matches `.btn-delete`
    - Reads `data-id` from the button and calls `deleteTransaction(id)`
  - Implement `init()`:
    - Calls `initChart()`
    - Sets `transactions = loadFromStorage()`
    - Calls `renderAll()`
  - Call `init()` at the bottom of the file (or via `DOMContentLoaded` if `defer` is not used)
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.3, 5.3, 5.4_

- [ ] 10. Final checkpoint — Full integration
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify the following flows in a browser:
    - Adding a transaction updates the balance, list, and chart immediately
    - Deleting a transaction updates the balance, list, and chart immediately
    - Submitting an empty form shows inline error messages and does not add a transaction
    - Refreshing the page reloads all transactions from Local Storage
    - Layout is usable on a narrow (mobile) viewport

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical milestones
- Property tests validate universal correctness properties (Properties 1–7 from the design document)
- Unit tests should cover specific examples and edge cases not covered by property tests
- The chart instance must be initialized before `renderAll()` is first called — `initChart()` must run inside `init()` before `loadFromStorage`
