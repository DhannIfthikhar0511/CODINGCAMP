// ── STATE ──────────────────────────────────────────────────────────────────

/** @type {import('./app').Transaction[]} */
let transactions = [];

const STORAGE_KEY = "expense_transactions";

// ── STORAGE ────────────────────────────────────────────────────────────────

/**
 * Serialize and persist the transactions array to localStorage.
 * @param {Object[]} txArray
 */
function saveToStorage(txArray) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txArray));
  } catch (e) {
    // localStorage may be unavailable (private mode, quota exceeded, etc.)
    showStorageWarning();
  }
}

/**
 * Read and parse transactions from localStorage.
 * Returns an empty array and shows a warning if data is absent or malformed.
 * @returns {Object[]}
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Malformed data");
    return parsed;
  } catch (e) {
    showStorageWarning();
    return [];
  }
}

/**
 * Insert (or reveal) a warning banner at the top of the page.
 */
function showStorageWarning() {
  const existingBanner = document.getElementById("storage-warning");
  if (existingBanner) {
    existingBanner.style.display = "block";
    return;
  }

  const banner = document.createElement("div");
  banner.id = "storage-warning";
  banner.setAttribute("role", "alert");
  banner.style.cssText = [
    "background:#fef3c7",
    "border:1px solid #fcd34d",
    "color:#92400e",
    "padding:0.6rem 1rem",
    "font-size:0.875rem",
    "text-align:center",
  ].join(";");
  banner.textContent =
    "⚠️ Local Storage is unavailable or contains invalid data. Your expenses will not be saved between sessions.";

  document.body.insertAdjacentElement("afterbegin", banner);
}

// ── VALIDATION ─────────────────────────────────────────────────────────────

/**
 * Validate the raw form values.
 * @param {string} name   - Raw value from #input-name
 * @param {string} amount - Raw value from #input-amount
 * @returns {string[]} Array of error messages; empty means valid.
 */
function validateForm(name, amount) {
  const errors = [];

  if (!name || name.trim() === "") {
    errors.push("Item Name is required.");
  }

  if (!amount || amount.trim() === "") {
    errors.push("Amount is required.");
  } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    errors.push("Amount must be a positive number.");
  }

  return errors;
}

/**
 * Display one or more validation error messages in #form-error.
 * @param {string[]} messages
 */
function showFormError(messages) {
  const el = document.getElementById("form-error");
  el.textContent = messages.join(" ");
  el.style.display = "block";
}

/**
 * Clear and hide the #form-error element.
 */
function clearFormError() {
  const el = document.getElementById("form-error");
  el.textContent = "";
  el.style.display = "none";
}

// ── TRANSACTIONS ───────────────────────────────────────────────────────────

/**
 * Format a numeric amount as a Rupiah string, e.g. "Rp 25.000".
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  return (
    "Rp " +
    amount.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

/**
 * Create a new transaction, persist it, and re-render the UI.
 * @param {string} name
 * @param {string|number} amount
 * @param {string} category
 */
function addTransaction(name, amount, category) {
  const transaction = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
    name: name.trim(),
    amount: parseFloat(amount),
    category,
  };

  transactions.push(transaction);
  saveToStorage(transactions);
  renderAll();
}

/**
 * Remove the transaction with the given id, persist, and re-render.
 * @param {string} id
 */
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveToStorage(transactions);
  renderAll();
}

// ── RENDER ─────────────────────────────────────────────────────────────────

/**
 * Update the balance display with the sum of all transaction amounts.
 * @param {Object[]} txArray
 */
function renderBalance(txArray) {
  const total = txArray.reduce((sum, t) => sum + t.amount, 0);
  document.getElementById("balance-display").textContent = formatCurrency(total);
}

/**
 * Rebuild the transaction list in the DOM.
 * @param {Object[]} txArray
 */
function renderTransactionList(txArray) {
  const list = document.getElementById("transaction-list");
  list.innerHTML = "";

  if (txArray.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No expenses recorded yet.";
    list.appendChild(empty);
    return;
  }

  txArray.forEach((t) => {
    const li = document.createElement("li");
    li.dataset.id = t.id;

    const nameSpan = document.createElement("span");
    nameSpan.className = "tx-name";
    nameSpan.textContent = t.name;

    const amountSpan = document.createElement("span");
    amountSpan.className = "tx-amount";
    amountSpan.textContent = formatCurrency(t.amount);

    const categorySpan = document.createElement("span");
    categorySpan.className = "tx-category";
    categorySpan.textContent = t.category;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.dataset.id = t.id;
    deleteBtn.setAttribute("aria-label", `Delete ${t.name}`);
    deleteBtn.textContent = "×";

    li.appendChild(nameSpan);
    li.appendChild(amountSpan);
    li.appendChild(categorySpan);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

/**
 * Re-render all UI components in sync.
 */
function renderAll() {
  renderTransactionList(transactions);
  renderBalance(transactions);
  updateChart(transactions);
}

// ── CHART ──────────────────────────────────────────────────────────────────

/** @type {import('chart.js').Chart|null} */
let chartInstance = null;

/**
 * Create the Chart.js pie chart and assign it to chartInstance.
 * Must be called before renderAll().
 */
function initChart() {
  const canvas = document.getElementById("expense-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Food", "Transport", "Fun"],
      datasets: [
        {
          data: [1, 1, 1], // neutral empty state
          backgroundColor: ["#e0e0e0", "#e0e0e0", "#e0e0e0"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { enabled: true },
      },
    },
  });
}

/**
 * Update the pie chart to reflect current category totals.
 * Falls back gracefully if Chart.js failed to load.
 * @param {Object[]} txArray
 */
function updateChart(txArray) {
  if (!chartInstance) return;

  const totals = { Food: 0, Transport: 0, Fun: 0 };
  txArray.forEach((t) => {
    if (totals[t.category] !== undefined) {
      totals[t.category] += t.amount;
    }
  });

  const allZero = Object.values(totals).every((v) => v === 0);

  if (allZero) {
    chartInstance.data.datasets[0].data = [1, 1, 1];
    chartInstance.data.datasets[0].backgroundColor = [
      "#e0e0e0",
      "#e0e0e0",
      "#e0e0e0",
    ];
  } else {
    chartInstance.data.datasets[0].data = [
      totals.Food,
      totals.Transport,
      totals.Fun,
    ];
    chartInstance.data.datasets[0].backgroundColor = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
    ];
  }

  chartInstance.update();
}

// ── EVENT WIRING ───────────────────────────────────────────────────────────

/**
 * Attach the form submit handler.
 */
function wireFormSubmit() {
  const form = document.getElementById("expense-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("input-name").value;
    const amount = document.getElementById("input-amount").value;
    const category = document.getElementById("input-category").value;

    const errors = validateForm(name, amount);

    if (errors.length > 0) {
      showFormError(errors);
      return;
    }

    clearFormError();
    addTransaction(name, amount, category);
    form.reset();
  });
}

/**
 * Attach the delegated click handler for delete buttons on the list.
 */
function wireDeleteButtons() {
  const list = document.getElementById("transaction-list");

  list.addEventListener("click", (event) => {
    const btn = event.target.closest(".btn-delete");
    if (!btn) return;

    const id = btn.dataset.id;
    if (id) deleteTransaction(id);
  });
}

// ── INIT ───────────────────────────────────────────────────────────────────

/**
 * Bootstrap the application.
 */
function init() {
  initChart();
  transactions = loadFromStorage();
  renderAll();
  wireFormSubmit();
  wireDeleteButtons();
}

init();
