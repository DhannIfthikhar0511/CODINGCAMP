# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses, categorize spending, and visualize their budget distribution through an interactive pie chart. The app runs entirely in the browser with no backend server, persisting all data via the browser's Local Storage API. It is built with plain HTML, CSS, and Vanilla JavaScript, and is designed to be simple, fast, and visually clear.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense entry consisting of an item name, amount, and category.
- **Transaction_List**: The scrollable UI component that displays all recorded transactions.
- **Input_Form**: The HTML form used to enter new transaction data.
- **Category**: A classification label for a transaction. Valid values are: Food, Transport, Fun.
- **Balance**: The computed sum of all transaction amounts currently stored.
- **Chart**: The pie chart component that visualizes spending distribution by category.
- **Local_Storage**: The browser's built-in client-side key-value storage API.
- **Validator**: The logic component responsible for checking that all required form fields are filled before submission.

---

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to enter expense details through a form, so that I can record my spending quickly and accurately.

#### Acceptance Criteria

1. THE Input_Form SHALL include a text field for Item Name, a numeric field for Amount, and a dropdown selector for Category with options Food, Transport, and Fun.
2. WHEN a user submits the Input_Form with all fields filled, THE App SHALL create a new Transaction and add it to the Transaction_List.
3. WHEN a user submits the Input_Form with one or more empty fields, THE Validator SHALL prevent submission and display an inline error message indicating which fields are missing.
4. WHEN a user submits the Input_Form with a non-positive or non-numeric Amount, THE Validator SHALL prevent submission and display an error message indicating the Amount must be a positive number.
5. WHEN a Transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty state.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see all my recorded expenses in a scrollable list, so that I can review and manage my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all stored Transactions, each showing the Item Name, Amount, and Category.
2. WHILE the Transaction_List contains more items than fit in the visible area, THE Transaction_List SHALL remain scrollable regardless of the current app state.
3. WHEN a user clicks the delete button on a Transaction, THE App SHALL remove that Transaction from the Transaction_List and from Local_Storage.
4. WHEN no Transactions exist, THE Transaction_List SHALL display a placeholder message indicating that no expenses have been recorded yet.

---

### Requirement 3: Total Balance Display

**User Story:** As a user, I want to see my total spending at a glance, so that I can quickly understand how much I have spent overall.

#### Acceptance Criteria

1. THE App SHALL display the total Balance at the top of the page, computed as the sum of all Transaction amounts.
2. WHEN a Transaction is added, THE App SHALL update the Balance display immediately without requiring a page reload.
3. WHEN a Transaction is deleted, THE App SHALL update the Balance display immediately without requiring a page reload.
4. WHEN no Transactions exist, THE App SHALL display a Balance of 0.

---

### Requirement 4: Visual Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand how my budget is distributed.

#### Acceptance Criteria

1. THE Chart SHALL display spending distribution as a pie chart segmented by Category (Food, Transport, Fun).
2. WHEN a Transaction is added, THE Chart SHALL update automatically to reflect the new spending distribution.
3. WHEN a Transaction is deleted, THE Chart SHALL update automatically to reflect the revised spending distribution.
4. WHEN only one Category has a non-zero spending amount, THE Chart SHALL display a single full-circle segment for that Category.
5. WHEN no Transactions exist or the total spending across all Categories is zero, THE Chart SHALL display a neutral empty state (e.g., a placeholder or greyed-out chart).

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my expense data to be saved between sessions, so that I do not lose my records when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a Transaction is added, THE App SHALL persist the Transaction to Local_Storage immediately.
2. WHEN a Transaction is deleted, THE App SHALL remove the Transaction from Local_Storage immediately.
3. WHEN the App loads, THE App SHALL read all Transactions from Local_Storage and render them in the Transaction_List, Balance display, and Chart.
4. IF Local_Storage is unavailable or returns malformed data, THEN THE App SHALL initialize with an empty Transaction_List and display a warning message to the user. No warning SHALL be shown for any other error conditions.

---

### Requirement 6: Technical Constraints Compliance

**User Story:** As a developer, I want the app to follow the defined technical constraints, so that the codebase remains simple, maintainable, and dependency-free.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no frontend frameworks.
2. THE App SHALL use exactly one CSS file located inside a `css/` directory.
3. THE App SHALL use exactly one JavaScript file located inside a `js/` directory.
4. THE App SHALL function correctly in modern versions of Chrome, Firefox, Edge, and Safari without requiring any server-side runtime.
5. WHERE a charting library is needed, THE App SHALL load Chart.js (or an equivalent lightweight library) via a CDN link in the HTML file.

---

### Requirement 7: Non-Functional Quality

**User Story:** As a user, I want the app to be fast, clean, and easy to use, so that I can manage my expenses without friction.

#### Acceptance Criteria

1. THE App SHALL load and become interactive within 3 seconds on a standard broadband connection.
2. WHEN a user adds or deletes a Transaction, THE App SHALL update the Balance, Transaction_List, and Chart within 100 milliseconds with no tolerance for exceeding this limit.
3. THE App SHALL use a clean, minimal visual design with clear visual hierarchy and readable typography.
4. THE App SHALL be usable on both desktop and mobile screen sizes through responsive layout techniques.
