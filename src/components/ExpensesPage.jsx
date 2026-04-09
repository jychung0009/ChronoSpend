import { useState, useRef } from "react";
import { MONTHS_SHORT, MONTHS_FULL } from "../utils/dateHelpers";
import { useOutsideClose, useIsMobile } from "../utils/hooks";

// ── Constants ──────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", symbol: "$",   label: "USD – US Dollar" },
  { code: "CAD", symbol: "CA$", label: "CAD – Canadian Dollar" },
  { code: "KRW", symbol: "₩",   label: "KRW – Korean Won" },
  { code: "EUR", symbol: "€",   label: "EUR – Euro" },
  { code: "GBP", symbol: "£",   label: "GBP – British Pound" },
  { code: "JPY", symbol: "¥",   label: "JPY – Japanese Yen" },
  { code: "AUD", symbol: "A$",  label: "AUD – Australian Dollar" },
  { code: "CNY", symbol: "CN¥", label: "CNY – Chinese Yuan" },
];

function currencySymbol(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

const CATEGORIES = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Health", "Education", "Travel", "Other"];

const CATEGORY_ICONS = {
  food: "🍔", transport: "🚗", entertainment: "🎬", shopping: "🛍️",
  bills: "📋", health: "💊", education: "📚", travel: "✈️", other: "📦",
};

const CATEGORY_COLORS = {
  food:          { bg: "#FFF3E0", color: "#E65100" },
  transport:     { bg: "#E3F2FD", color: "#1565C0" },
  entertainment: { bg: "#F3E5F5", color: "#6A1B9A" },
  shopping:      { bg: "#E8F5E9", color: "#2E7D32" },
  bills:         { bg: "#F5F5F5", color: "#616161" },
  health:        { bg: "#FCE4EC", color: "#AD1457" },
  education:     { bg: "#E8EAF6", color: "#283593" },
  travel:        { bg: "#E0F7FA", color: "#006064" },
  other:         { bg: "#F0EDE8", color: "#6B6780" },
};

const INCOME_CATEGORIES = ["Salary", "Freelance", "Gift", "Investment", "Refund", "Other"];

const INCOME_CATEGORY_ICONS = {
  salary:     "💼",
  freelance:  "💻",
  gift:       "🎁",
  investment: "📈",
  refund:     "↩️",
  other:      "💰",
};

const INCOME_CATEGORY_COLORS = {
  salary:     { bg: "#E8F5E9", color: "#2E7D32" },
  freelance:  { bg: "#E0F7FA", color: "#006064" },
  gift:       { bg: "#FFF8E1", color: "#F57F17" },
  investment: { bg: "#E8EAF6", color: "#283593" },
  refund:     { bg: "#F3E5F5", color: "#6A1B9A" },
  other:      { bg: "#F0EDE8", color: "#6B6780" },
};


// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`;
}

function formatAmount(n, currency = "USD") {
  const sym = currencySymbol(currency);
  const decimals = currency === "KRW" || currency === "JPY" ? 0 : 2;
  return sym + n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ── Icons ──────────────────────────────────────────────────────────────────
function IconEdit()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function IconTrash()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>; }
function IconSearch()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function IconChevron() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>; }
function IconCheck()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function IconCalendar(){ return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconClose()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function IconWallet()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>; }
function IconTrend()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>; }
function IconDown()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 13 12 17 16 13"/><line x1="12" y1="7" x2="12" y2="17"/></svg>; }
function IconBack()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function IconReport()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }

// ── Category Dropdown ──────────────────────────────────────────────────────
function CategoryDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  useOutsideClose([btnRef, dropRef], () => setOpen(false));

  const options = ["All Categories", ...CATEGORIES];
  return (
    <div style={{ position: "relative" }}>
      <button ref={btnRef} style={st.filterBtn} onClick={() => setOpen((o) => !o)}>
        {value}
        <span style={{ color: "#9B97A8" }}><IconChevron /></span>
      </button>
      {open && (
        <div ref={dropRef} style={st.dropdown}>
          {options.map((opt) => {
            const active = opt === value;
            return (
              <button
                key={opt}
                style={{ ...st.dropItem, background: active ? "#FFF8F5" : "transparent", color: active ? "#E8654A" : "#1a1a2e" }}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {opt}
                {active && <span style={{ color: "#E8654A" }}><IconCheck /></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Date Range Picker ──────────────────────────────────────────────────────
function DateRangePicker({ startDate, endDate, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const [localStart, setLocalStart] = useState(startDate || "");
  const [localEnd,   setLocalEnd]   = useState(endDate   || "");
  const btnRef  = useRef(null);
  const dropRef = useRef(null);
  useOutsideClose([btnRef, dropRef], () => setOpen(false));

  const hasFilter = startDate || endDate;

  const apply = () => { onChange(localStart, localEnd); setOpen(false); };

  const handleOpen = () => {
    setLocalStart(startDate || "");
    setLocalEnd(endDate || "");
    setOpen((o) => !o);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={btnRef}
        style={{ ...st.toolBtn, ...(hasFilter ? st.toolBtnActive : {}) }}
        onClick={handleOpen}
      >
        <IconCalendar />
        {hasFilter
          ? `${startDate ? formatDate(startDate) : "Start"} – ${endDate ? formatDate(endDate) : "End"}`
          : "Filter by Date"}
        {hasFilter && (
          <span
            style={st.clearX}
            onClick={(e) => { e.stopPropagation(); onClear(); setLocalStart(""); setLocalEnd(""); }}
          >
            <IconClose />
          </span>
        )}
      </button>
      {open && (
        <div ref={dropRef} style={st.dateDropdown}>
          <div style={st.dropTitle}>Select date range</div>
          <div style={st.dateRow}>
            <div style={st.dateField}>
              <label style={st.dateLabel}>From</label>
              <input type="date" value={localStart} onChange={(e) => setLocalStart(e.target.value)} style={st.dateInput} />
            </div>
            <div style={st.dateField}>
              <label style={st.dateLabel}>To</label>
              <input type="date" value={localEnd} min={localStart || undefined} onChange={(e) => setLocalEnd(e.target.value)} style={st.dateInput} />
            </div>
          </div>
          <div style={st.dateActions}>
            <button style={st.dateClearBtn} onClick={() => { setLocalStart(""); setLocalEnd(""); }}>Clear</button>
            <button style={st.dateApplyBtn} onClick={apply}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Monthly Report Picker ──────────────────────────────────────────────────
function MonthlyReportPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const btnRef  = useRef(null);
  const dropRef = useRef(null);
  useOutsideClose([btnRef, dropRef], () => setOpen(false));

  return (
    <div style={{ position: "relative" }}>
      <button ref={btnRef} style={st.toolBtn} onClick={() => setOpen((o) => !o)}>
        <IconReport />
        Monthly Report
        <span style={{ color: "#9B97A8" }}><IconChevron /></span>
      </button>
      {open && (
        <div ref={dropRef} style={st.monthPickerDrop}>
          <div style={st.monthPickerNav}>
            <button style={st.mpNavBtn} onClick={() => setPickerYear((y) => y - 1)}>‹</button>
            <span style={st.mpNavYear}>{pickerYear}</span>
            <button style={st.mpNavBtn} onClick={() => setPickerYear((y) => y + 1)}>›</button>
          </div>
          <div style={st.monthPickerGrid}>
            {MONTHS_SHORT.map((label, m) => {
              const isCurrent = m === today.getMonth() && pickerYear === today.getFullYear();
              return (
                <button
                  key={m}
                  style={{
                    ...st.mpCell,
                    background: isCurrent ? "#FFF8F5" : "transparent",
                    color:      isCurrent ? "#E8654A" : "#1a1a2e",
                    border:     isCurrent ? "1px solid #E8654A55" : "1px solid transparent",
                    fontWeight: isCurrent ? 700 : 400,
                  }}
                  onClick={() => { onSelect(pickerYear, m); setOpen(false); }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add / Edit Expense Modal ───────────────────────────────────────────────
function ExpenseModal({ expense, onSave, onClose }) {
  const isMobile = useIsMobile();
  const [type,     setType]     = useState(expense?.type     || "expense");
  const [name,     setName]     = useState(expense?.name     || "");
  const [amount,   setAmount]   = useState(expense?.amount   ? String(expense.amount) : "");
  const [currency, setCurrency] = useState(expense?.currency || "USD");
  const [date,     setDate]     = useState(expense?.date     || new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(expense?.category || "food");
  const [error,    setError]    = useState("");

  const isIncome = type === "income";

  // Reset category to a valid default when switching type
  const handleTypeChange = (t) => {
    setType(t);
    setCategory(t === "income" ? "salary" : "food");
  };

  const handleSave = () => {
    if (!name.trim())           { setError("Please enter a name."); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError("Please enter a valid amount."); return; }
    if (!date)                  { setError("Please select a date."); return; }
    onSave({ id: expense?.id || crypto.randomUUID(), type, name: name.trim(), amount: amt, currency, date, category });
  };

  const cats        = isIncome ? INCOME_CATEGORIES      : CATEGORIES;
  const catIcons    = isIncome ? INCOME_CATEGORY_ICONS  : CATEGORY_ICONS;
  const catColors   = isIncome ? INCOME_CATEGORY_COLORS : CATEGORY_COLORS;
  const defaultCat  = isIncome ? INCOME_CATEGORY_COLORS.other : CATEGORY_COLORS.other;

  const modalTitle = expense
    ? (isIncome ? "Edit Income" : "Edit Expense")
    : (isIncome ? "Add Income"  : "Add Expense");

  return (
    <div style={st.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...st.modal, width: isMobile ? "calc(100% - 32px)" : 480, maxHeight: isMobile ? "90vh" : "85vh", overflowY: "auto" }}>
        <div style={st.modalHeader}>
          <h2 style={st.modalTitle}>{modalTitle}</h2>
          <button style={st.modalClose} onClick={onClose}><IconClose /></button>
        </div>

        {/* Type toggle */}
        <div style={st.typeToggleRow}>
          {["expense", "income"].map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              style={{
                ...st.typeToggleBtn,
                background: type === t ? (t === "income" ? "#E8F5E9" : "#FFF3E0") : "transparent",
                color:      type === t ? (t === "income" ? "#2E7D32" : "#E65100") : "#9B97A8",
                border:     type === t
                  ? `1.5px solid ${t === "income" ? "#2E7D3240" : "#E6510040"}`
                  : "1.5px solid transparent",
                fontWeight: type === t ? 700 : 400,
              }}
            >
              {t === "expense" ? "Expense" : "Income"}
            </button>
          ))}
        </div>

        <div style={st.formGroup}>
          <label style={st.label}>Name</label>
          <input style={st.input} placeholder="e.g. Coffee & Lunch" value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }} />
        </div>

        <div style={{ ...st.formRow, flexDirection: isMobile ? "column" : "row" }}>
          <div style={{ ...st.formGroup, flex: 1 }}>
            <label style={st.label}>Amount</label>
            <div style={{ display: "flex", gap: 6 }}>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ ...st.input, width: "auto", paddingRight: 8, flexShrink: 0, cursor: "pointer" }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <input style={{ ...st.input, flex: 1 }} type="number" min="0" step="0.01" placeholder="0.00" value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }} />
            </div>
          </div>
          <div style={{ ...st.formGroup, flex: 1 }}>
            <label style={st.label}>Date</label>
            <input style={st.input} type="date" value={date}
              onChange={(e) => { setDate(e.target.value); setError(""); }} />
          </div>
        </div>

        <div style={st.formGroup}>
          <label style={st.label}>Category</label>
          <div style={st.categoryGrid}>
            {cats.map((cat) => {
              const key    = cat.toLowerCase();
              const active = category === key;
              const colors = catColors[key] || defaultCat;
              return (
                <button
                  key={key}
                  style={{
                    ...st.catChip,
                    background: active ? colors.bg : "#F5F0E8",
                    color:      active ? colors.color : "#6B6780",
                    border:     active ? `1.5px solid ${colors.color}40` : "1.5px solid transparent",
                  }}
                  onClick={() => setCategory(key)}
                >
                  <span style={{ fontSize: 14 }}>{catIcons[key]}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p style={st.errorMsg}>{error}</p>}

        <div style={st.modalFooter}>
          <button style={st.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={st.saveBtn} onClick={handleSave}>{expense ? "Save Changes" : (isIncome ? "Add Income" : "Add Expense")}</button>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, iconBg, iconColor, valueStyle, isMobile }) {
  return (
    <div style={{ ...st.statCard, padding: isMobile ? "14px 14px" : "24px 24px", gap: isMobile ? 10 : 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...st.statLabel, fontSize: isMobile ? 10 : 11 }}>{label}</div>
        <div style={{ ...st.statValue, fontSize: isMobile ? 20 : 32, ...(valueStyle || {}), letterSpacing: isMobile ? "-0.5px" : "-1px" }}>{value}</div>
      </div>
      <div style={{ ...st.statIcon, width: isMobile ? 34 : 44, height: isMobile ? 34 : 44, background: iconBg, color: iconColor, flexShrink: 0 }}>{icon}</div>
    </div>
  );
}

// ── Expense Row ────────────────────────────────────────────────────────────
function ExpenseRow({ expense, onEdit, onDelete, onToggleReceived }) {
  const isMobile  = useIsMobile();
  const [hover,    setHover]    = useState(false);
  const [confirm,  setConfirm]  = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isIncome    = expense.type === "income";
  const hasSplit    = !!expense.billSplit?.people?.length;
  const colorMap    = isIncome ? INCOME_CATEGORY_COLORS : CATEGORY_COLORS;
  const iconMap     = isIncome ? INCOME_CATEGORY_ICONS  : CATEGORY_ICONS;
  const labelArr    = isIncome ? INCOME_CATEGORIES      : CATEGORIES;
  const colors      = colorMap[expense.category] || colorMap.other;
  const icon        = iconMap[expense.category]  || (isIncome ? "💰" : "📦");
  const catLabel    = labelArr.find((c) => c.toLowerCase() === expense.category) || expense.category;

  const receivedTotal = hasSplit
    ? expense.billSplit.people.filter((p) => p.received).reduce((s, p) => s + p.owes, 0)
    : 0;
  const netAmount = expense.amount - receivedTotal;
  const allReceived = hasSplit && expense.billSplit.people.every((p) => p.received);

  return (
    <div style={{ borderBottom: "1px solid #F0ECE8" }}>
      <div
        style={{ ...st.row, borderBottom: "none", background: hover ? "#FAFAF8" : "#fff" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); setConfirm(false); }}
      >
        <div style={{ ...st.rowIcon, background: colors.bg }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
        </div>
        <div style={st.rowInfo}>
          <div style={st.rowName}>{expense.name}</div>
          <div style={st.rowMeta}>
            {formatDate(expense.date)}
            <span style={{ ...st.badge, background: colors.bg, color: colors.color }}>
              {catLabel.toLowerCase()}
            </span>
            {hasSplit && (
              <span style={{ ...st.badge, background: "#E8EAF6", color: "#283593" }}>
                bill split · {expense.billSplit.people.filter((p) => p.received).length}/{expense.billSplit.people.length} received
              </span>
            )}
          </div>
        </div>
        <div style={st.rowRight}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span style={{ ...st.rowAmount, color: isIncome ? "#2E7D32" : allReceived ? "#9B97A8" : "#1a1a2e" }}>
              {isIncome ? "+" : ""}{formatAmount(hasSplit ? netAmount : expense.amount, expense.currency)}
            </span>
            {hasSplit && receivedTotal > 0 && !allReceived && (
              <span style={{ fontSize: 11, color: "#9B97A8" }}>
                of {formatAmount(expense.amount, expense.currency)}
              </span>
            )}
            {allReceived && (
              <span style={{ fontSize: 11, color: "#2E7D32", fontWeight: 600 }}>fully received</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {hasSplit && (
              <button
                style={{ ...st.actionBtn, color: "#283593" }}
                onClick={() => setExpanded((v) => !v)}
                title={expanded ? "Collapse" : "Track payments"}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {expanded
                    ? <polyline points="18 15 12 9 6 15"/>
                    : <polyline points="6 9 12 15 18 9"/>}
                </svg>
              </button>
            )}
            {(hover || isMobile) && (
              <div style={st.rowActions}>
                {confirm ? (
                  <>
                    <button style={st.actionBtn} onClick={() => setConfirm(false)}>Cancel</button>
                    <button style={{ ...st.actionBtn, color: "#E8654A", fontWeight: 700 }} onClick={onDelete}>Delete</button>
                  </>
                ) : (
                  <>
                    <button style={st.actionBtn} onClick={onEdit} title="Edit"><IconEdit /></button>
                    <button style={{ ...st.actionBtn, color: "#E8654A" }} onClick={() => setConfirm(true)} title="Delete"><IconTrash /></button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill split tracker */}
      {hasSplit && expanded && (
        <div style={st.splitTracker}>
          {expense.billSplit.people.map((person) => (
            <div key={person.id} style={st.splitRow}>
              <span style={{ ...st.splitName, textDecoration: person.received ? "line-through" : "none", color: person.received ? "#9B97A8" : "#1a1a2e" }}>
                {person.name}
              </span>
              <span style={{ ...st.splitAmt, color: person.received ? "#9B97A8" : "#1a1a2e" }}>
                {formatAmount(person.owes, expense.currency)}
              </span>
              <button
                onClick={() => onToggleReceived(expense.id, person.id)}
                style={{
                  ...st.receivedBtn,
                  background: person.received ? "#E8F5E9" : "#F5F0E8",
                  color:      person.received ? "#2E7D32" : "#9B97A8",
                  border:     person.received ? "1px solid #A5D6A7" : "1px solid transparent",
                }}
              >
                {person.received ? "✓ Received" : "Mark received"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared expense list + stats block ─────────────────────────────────────
function ExpenseContent({ expenses, onSaveExpense, onDeleteExpense, reportMonth }) {
  const isMobile = useIsMobile();
  const [search,      setSearch]      = useState("");
  const [categoryFil, setCategoryFil] = useState("All Categories");
  const [typeFil,     setTypeFil]     = useState("all"); // "all" | "expense" | "income"
  const [modal,       setModal]       = useState(null);

  const onlyExpenses = expenses.filter((ex) => ex.type !== "income");
  const onlyIncome   = expenses.filter((ex) => ex.type === "income");

  const filtered = expenses.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = categoryFil === "All Categories" || ex.category === categoryFil.toLowerCase();
    const matchType   = typeFil === "all" || ex.type === typeFil || (typeFil === "expense" && !ex.type);
    return matchSearch && matchCat && matchType;
  });
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  // Stats
  const totalSpending = onlyExpenses.reduce((s, ex) => s + ex.amount, 0);
  const totalIncome   = onlyIncome.reduce((s, ex) => s + ex.amount, 0);
  const netBalance    = totalIncome - totalSpending;

  const catTotals = {};
  onlyExpenses.forEach((ex) => { catTotals[ex.category] = (catTotals[ex.category] || 0) + ex.amount; });
  const topCat      = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  const topCatLabel = topCat === "—" ? "—"
    : CATEGORIES.find((c) => c.toLowerCase() === topCat) || topCat;

  const netColor = netBalance >= 0 ? "#2E7D32" : "#E8654A";

  return (
    <>
      {/* Stat Cards */}
      <div style={{ ...st.statsRow, gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)" }}>
        <StatCard label={reportMonth ? "TOTAL SPENT" : "THIS MONTH"} value={formatAmount(totalSpending)}
          icon={<IconWallet />} iconBg="#FFF3E0" iconColor="#E8654A" isMobile={isMobile} />
        <StatCard label="MONTHLY INCOME" value={formatAmount(totalIncome)}
          icon={<IconTrend />} iconBg="#E8F5E9" iconColor="#2E7D32" valueStyle={{ color: "#2E7D32" }} isMobile={isMobile} />
        <StatCard label="NET BALANCE" value={`${netBalance >= 0 ? "+" : ""}${formatAmount(Math.abs(netBalance))}`}
          icon={<IconDown />} iconBg={netBalance >= 0 ? "#E8F5E9" : "#FFF3E0"} iconColor={netColor}
          valueStyle={{ color: netColor, fontSize: isMobile ? undefined : 24 }} isMobile={isMobile} />
        <StatCard label="TOP CATEGORY" value={topCatLabel}
          icon={<IconDown />} iconBg="#F3E5F5" iconColor="#7B1FA2" valueStyle={{ fontSize: isMobile ? undefined : 24 }} isMobile={isMobile} />
      </div>

      {/* Search + Filters */}
      <div style={{ ...st.filterRow, flexWrap: "wrap", rowGap: 8 }}>
        <div style={{ ...st.searchWrap, flexBasis: isMobile ? "100%" : "auto" }}>
          <span style={st.searchIcon}><IconSearch /></span>
          <input
            style={st.searchInput}
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Type filter pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {[["all", "All"], ["expense", "Expenses"], ["income", "Income"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTypeFil(val)}
              style={{
                ...st.filterPill,
                background: typeFil === val ? "#1a1a2e" : "#F5F0E8",
                color:      typeFil === val ? "#fff"    : "#6B6780",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <CategoryDropdown value={categoryFil} onChange={setCategoryFil} />
      </div>

      {/* List */}
      <div style={st.list}>
        {sorted.length === 0 ? (
          <div style={st.empty}>No expenses found.</div>
        ) : (
          sorted.map((ex) => (
            <ExpenseRow
              key={ex.id}
              expense={ex}
              onEdit={() => setModal(ex)}
              onDelete={() => onDeleteExpense(ex.id)}
              onToggleReceived={(_, personId) => {
                const updated = {
                  ...ex,
                  billSplit: {
                    ...ex.billSplit,
                    people: ex.billSplit.people.map((p) =>
                      p.id === personId ? { ...p, received: !p.received } : p
                    ),
                  },
                };
                onSaveExpense(updated);
              }}
            />
          ))
        )}
      </div>

      {modal && (
        <ExpenseModal
          expense={modal === "add" ? null : modal}
          onSave={(ex) => { onSaveExpense(ex); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

// ── Main Expenses Page ─────────────────────────────────────────────────────
export default function ExpensesPage({ expenses, onSaveExpense, onDeleteExpense, isMobile }) {
  const [startDate,    setStartDate]    = useState("");
  const [endDate,      setEndDate]      = useState("");
  const [modal,        setModal]        = useState(null);
  const [reportMonth,  setReportMonth]  = useState(null); // null | { year, month }

  const saveExpense = (ex) => { onSaveExpense(ex); setModal(null); };
  const deleteExpense = (id) => onDeleteExpense(id);

  // ── Monthly report view ───────────────────────────────────────────────────
  if (reportMonth) {
    const { year, month } = reportMonth;
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthExpenses = expenses.filter((ex) => ex.date.startsWith(monthStr));

    return (
      <div style={{ ...st.page, padding: isMobile ? "16px" : "32px 28px", paddingBottom: isMobile ? 88 : "32px" }}>
        {/* Back + header */}
        <div style={st.pageHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button style={st.backBtn} onClick={() => setReportMonth(null)}>
              <IconBack />
              Back
            </button>
            <div>
              <h1 style={st.pageTitle}>{MONTHS_FULL[month]} {year}</h1>
              <p style={st.pageSub}>Monthly expense report</p>
            </div>
          </div>
          <button style={st.addBtn} onClick={() => setModal("add")}>+ Add Expense</button>
        </div>

        <ExpenseContent
          expenses={monthExpenses}
          onSaveExpense={saveExpense}
          onDeleteExpense={deleteExpense}
          reportMonth={reportMonth}
        />

        {modal && (
          <ExpenseModal
            expense={null}
            onSave={saveExpense}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  const mainExpenses = expenses.filter((ex) => {
    const matchStart = !startDate || ex.date >= startDate;
    const matchEnd   = !endDate   || ex.date <= endDate;
    return matchStart && matchEnd;
  });

  return (
    <div style={{ ...st.page, padding: isMobile ? "16px" : "32px 28px", paddingBottom: isMobile ? 88 : "32px" }}>
      {/* Page Header */}
      <div style={{ ...st.pageHeader, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={st.pageTitle}>Expenses</h1>
          <p style={st.pageSub}>Track and manage your spending</p>
        </div>
        <button style={st.addBtn} onClick={() => setModal("add")}>+ Add Expense</button>
      </div>

      {/* Filter toolbar */}
      <div style={st.toolbar}>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
          onClear={() => { setStartDate(""); setEndDate(""); }}
        />
        <MonthlyReportPicker onSelect={(y, m) => setReportMonth({ year: y, month: m })} />
      </div>

      <ExpenseContent
        expenses={mainExpenses}
        onSaveExpense={saveExpense}
        onDeleteExpense={deleteExpense}
        reportMonth={null}
      />

      {modal && (
        <ExpenseModal
          expense={null}
          onSave={saveExpense}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const st = {
  page: { flex: 1, display: "flex", flexDirection: "column", padding: "32px 28px", gap: 20, minWidth: 0 },

  // Header
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  pageTitle:  { fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: "-0.5px", color: "#1a1a2e" },
  pageSub:    { fontSize: 13, color: "#9B97A8", margin: "4px 0 0" },
  addBtn: {
    background: "#E8654A", border: "none", color: "#fff",
    borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700,
    cursor: "pointer", whiteSpace: "nowrap",
  },

  // Back button
  backBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#fff", border: "1px solid #E8E0D0",
    borderRadius: 10, padding: "8px 14px",
    fontSize: 13, fontWeight: 600, color: "#1a1a2e",
    cursor: "pointer", transition: "background 0.15s",
  },

  // Toolbar
  toolbar: { display: "flex", gap: 10, alignItems: "center" },

  // Shared tool button
  toolBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fff", border: "1px solid #E8E0D0",
    borderRadius: 10, padding: "9px 14px",
    fontSize: 13, fontWeight: 600, color: "#6B6780",
    cursor: "pointer", transition: "border-color 0.15s", whiteSpace: "nowrap",
  },
  toolBtnActive: { border: "1px solid #E8654A", color: "#E8654A", background: "#FFF8F5" },
  clearX: { display: "flex", alignItems: "center", color: "#9B97A8", marginLeft: 2, padding: 2, borderRadius: 4 },

  // Date dropdown
  dateDropdown: {
    position: "absolute", top: "calc(100% + 8px)", left: 0,
    zIndex: 600, background: "#fff", border: "1px solid #E8E0D0", borderRadius: 14,
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: "18px 20px", minWidth: 340,
  },
  dropTitle:  { fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 14 },
  dateRow:    { display: "flex", gap: 14, marginBottom: 16 },
  dateField:  { display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  dateLabel:  { fontSize: 11, fontWeight: 700, color: "#9B97A8", letterSpacing: "0.6px" },
  dateInput: {
    border: "1px solid #E8E0D0", borderRadius: 8, padding: "8px 10px",
    fontSize: 13, color: "#1a1a2e", outline: "none", background: "#FAFAF8", fontFamily: "inherit",
  },
  dateActions:  { display: "flex", justifyContent: "flex-end", gap: 8 },
  dateClearBtn: {
    background: "transparent", border: "1px solid #E8E0D0", borderRadius: 8,
    padding: "7px 16px", fontSize: 13, fontWeight: 600, color: "#6B6780", cursor: "pointer",
  },
  dateApplyBtn: {
    background: "#E8654A", border: "none", color: "#fff",
    borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
  },

  // Month picker dropdown
  monthPickerDrop: {
    position: "absolute", top: "calc(100% + 8px)", left: 0,
    zIndex: 600, background: "#fff", border: "1px solid #E8E0D0", borderRadius: 14,
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: "14px 12px 12px", minWidth: 260,
  },
  monthPickerNav: {
    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
  },
  mpNavBtn: {
    background: "#F0EDE8", border: "none", color: "#1a1a2e",
    width: 28, height: 28, borderRadius: 6, fontSize: 18,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  mpNavYear: { fontSize: 15, fontWeight: 700, color: "#1a1a2e" },
  monthPickerGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 },
  mpCell: {
    padding: "9px 4px", borderRadius: 8, fontSize: 13,
    cursor: "pointer", transition: "background 0.12s",
  },

  // Stats
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  statCard: {
    background: "#fff", border: "1px solid #E8E0D0", borderRadius: 16,
    padding: "24px 24px", display: "flex", alignItems: "center", gap: 16,
  },
  statLabel: { fontSize: 11, fontWeight: 700, color: "#9B97A8", letterSpacing: "0.8px", marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-1px", lineHeight: 1 },
  statIcon:  {
    width: 44, height: 44, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },

  // Filter row
  filterRow: { display: "flex", gap: 12, alignItems: "center" },
  filterPill: { padding: "6px 14px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  searchWrap: {
    flex: 1, position: "relative", background: "#fff", border: "1px solid #E8E0D0",
    borderRadius: 10, display: "flex", alignItems: "center",
  },
  searchIcon:  { position: "absolute", left: 14, color: "#9B97A8", display: "flex", alignItems: "center" },
  searchInput: {
    flex: 1, border: "none", outline: "none", background: "transparent",
    padding: "10px 14px 10px 40px", fontSize: 13, color: "#1a1a2e", fontFamily: "inherit",
  },
  filterBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fff", border: "1px solid #E8E0D0", borderRadius: 10, padding: "10px 14px",
    fontSize: 13, fontWeight: 600, color: "#1a1a2e", cursor: "pointer", whiteSpace: "nowrap",
  },
  dropdown: {
    position: "absolute", top: "calc(100% + 6px)", right: 0,
    zIndex: 600, background: "#fff", border: "1px solid #E8E0D0", borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 180, overflow: "hidden", padding: "6px 0",
  },
  dropItem: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", border: "none", padding: "9px 16px",
    fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left", transition: "background 0.1s",
  },

  // Expense list
  list:  { display: "flex", flexDirection: "column", gap: 8 },
  empty: { textAlign: "center", color: "#9B97A8", fontSize: 14, padding: "40px 0" },
  row: {
    background: "#fff", border: "1px solid #E8E0D0", borderRadius: 14,
    padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
    transition: "background 0.12s",
  },
  rowIcon: {
    width: 44, height: 44, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  rowInfo:   { flex: 1, minWidth: 0 },
  rowName:   { fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 4 },
  rowMeta:   { display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#9B97A8" },
  badge:     { display: "inline-block", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 },
  rowRight:  { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  rowAmount: { fontSize: 15, fontWeight: 700, color: "#1a1a2e" },
  rowActions: { display: "flex", gap: 6 },

  splitTracker: { background: "#F9F7F5", borderRadius: "0 0 10px 10px", padding: "8px 16px 12px 56px", display: "flex", flexDirection: "column", gap: 8 },
  splitRow:     { display: "flex", alignItems: "center", gap: 10 },
  splitName:    { flex: 1, fontSize: 13, color: "#1a1a2e" },
  splitAmt:     { fontSize: 13, fontWeight: 600, minWidth: 64, textAlign: "right" },
  receivedBtn:  { fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, cursor: "pointer", flexShrink: 0 },
  actionBtn: {
    background: "none", border: "none", cursor: "pointer", color: "#9B97A8",
    display: "flex", alignItems: "center", padding: 4, borderRadius: 6, transition: "color 0.12s",
  },

  // Modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: 20, padding: "28px 30px", width: "100%", maxWidth: 500,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 18,
  },
  typeToggleRow: { display: "flex", gap: 8, marginBottom: 4 },
  typeToggleBtn: { flex: 1, padding: "8px 0", borderRadius: 10, border: "1.5px solid transparent", fontSize: 14, cursor: "pointer" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle:  { fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: 0 },
  modalClose:  {
    background: "none", border: "none", cursor: "pointer",
    color: "#9B97A8", display: "flex", alignItems: "center", borderRadius: 8, padding: 4,
  },
  formGroup:    { display: "flex", flexDirection: "column", gap: 6 },
  formRow:      { display: "flex", gap: 14 },
  label:        { fontSize: 12, fontWeight: 700, color: "#6B6780", letterSpacing: "0.4px" },
  input: {
    border: "1px solid #E8E0D0", borderRadius: 10, padding: "10px 12px",
    fontSize: 13, color: "#1a1a2e", outline: "none", background: "#FAFAF8",
    fontFamily: "inherit", transition: "border-color 0.15s",
  },
  categoryGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  catChip: {
    display: "flex", alignItems: "center", gap: 6, borderRadius: 20, padding: "6px 14px",
    fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
  },
  errorMsg:    { fontSize: 12, color: "#E8654A", margin: 0 },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 },
  cancelBtn: {
    background: "transparent", border: "1px solid #E8E0D0", borderRadius: 10,
    padding: "9px 20px", fontSize: 13, fontWeight: 600, color: "#6B6780", cursor: "pointer",
  },
  saveBtn: {
    background: "#E8654A", border: "none", color: "#fff",
    borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
};
