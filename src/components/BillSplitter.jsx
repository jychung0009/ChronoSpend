import { useState } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────
function IconPlus()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function IconTrash() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>; }
function IconUser()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IconCopy()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>; }
function IconCheck() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(n) { return "$" + Math.abs(n).toFixed(2); }

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={s.section}>
      <h3 style={s.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

// ── Result card ────────────────────────────────────────────────────────────
function ResultCard({ name, personalSubtotal, sharedSubtotal, taxRate, tipRate }) {
  const subtotal  = personalSubtotal + sharedSubtotal;
  const afterTax  = subtotal * (1 + taxRate / 100);
  const total     = afterTax * (1 + tipRate / 100);
  const taxAmt    = afterTax - subtotal;
  const tipAmt    = total - afterTax;

  return (
    <div style={s.resultCard}>
      <div style={s.resultName}>
        <span style={s.resultAvatar}><IconUser /></span>
        {name}
      </div>
      <div style={s.resultRows}>
        <div style={s.resultRow}>
          <span style={s.resultLabel}>Personal items</span>
          <span style={s.resultVal}>{fmt(personalSubtotal)}</span>
        </div>
        <div style={s.resultRow}>
          <span style={s.resultLabel}>Shared items (split)</span>
          <span style={s.resultVal}>{fmt(sharedSubtotal)}</span>
        </div>
        <div style={s.resultRow}>
          <span style={s.resultLabel}>Tax ({taxRate}%)</span>
          <span style={s.resultVal}>{fmt(taxAmt)}</span>
        </div>
        <div style={s.resultRow}>
          <span style={s.resultLabel}>Tip ({tipRate}%)</span>
          <span style={s.resultVal}>{fmt(tipAmt)}</span>
        </div>
      </div>
      <div style={s.resultTotal}>
        <span>Total owed</span>
        <span style={s.resultTotalAmt}>{fmt(total)}</span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function BillSplitter({ onSaveExpense, isMobile }) {
  const [people,        setPeople]        = useState([{ id: "1", name: "Person 1" }]);
  const [personalItems, setPersonalItems] = useState([]);
  const [sharedItems,   setSharedItems]   = useState([]);
  const [taxRate,       setTaxRate]       = useState("");
  const [tipRate,       setTipRate]       = useState("");
  const [showResults,      setShowResults]      = useState(false);
  const [copied,           setCopied]           = useState(false);
  const [addedToExpenses,  setAddedToExpenses]  = useState(false);

  const tax = parseFloat(taxRate) || 0;
  const tip = parseFloat(tipRate) || 0;
  const N   = people.length;

  // ── People ───────────────────────────────────────────────────────────────
  const addPerson = () => {
    const id = crypto.randomUUID();
    setPeople((p) => [...p, { id, name: `Person ${p.length + 1}`, isSelf: false }]);
  };
  const updatePersonName = (id, name) => setPeople((p) => p.map((x) => x.id === id ? { ...x, name } : x));
  const toggleSelf = (id) => setPeople((p) => p.map((x) => x.id === id ? { ...x, isSelf: !x.isSelf } : x));
  const removePerson = (id) => {
    setPeople((p) => p.filter((x) => x.id !== id));
    setPersonalItems((items) => items.filter((i) => i.personId !== id));
  };

  // ── Personal items ───────────────────────────────────────────────────────
  const addPersonalItem = (personId) => {
    setPersonalItems((prev) => [...prev, { id: crypto.randomUUID(), personId, description: "", amount: "", count: "1" }]);
  };
  const updatePersonalItem = (id, field, val) =>
    setPersonalItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: val } : i));
  const removePersonalItem = (id) => setPersonalItems((prev) => prev.filter((i) => i.id !== id));

  // ── Shared items ─────────────────────────────────────────────────────────
  const addSharedItem = () => {
    setSharedItems((prev) => [...prev, { id: crypto.randomUUID(), description: "", amount: "", count: "1" }]);
  };
  const updateSharedItem = (id, field, val) =>
    setSharedItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: val } : i));
  const removeSharedItem = (id) => setSharedItems((prev) => prev.filter((i) => i.id !== id));

  // ── Results ──────────────────────────────────────────────────────────────
  const sharedTotal = sharedItems.reduce((s, i) => s + (parseFloat(i.amount) || 0) * (parseFloat(i.count) || 0), 0);
  const sharedPerPerson = N > 0 ? sharedTotal / N : 0;

  const results = people.map((person) => {
    const personalSubtotal = personalItems
      .filter((i) => i.personId === person.id)
      .reduce((s, i) => s + (parseFloat(i.amount) || 0) * (parseFloat(i.count) || 0), 0);
    return { ...person, personalSubtotal, sharedSubtotal: sharedPerPerson };
  });

  const grandTotal = results.reduce((s, r) => {
    const sub = r.personalSubtotal + r.sharedSubtotal;
    return s + sub * (1 + tax / 100) * (1 + tip / 100);
  }, 0);

  const generateExportText = () => {
    const line = "─────────────────────";
    const rows = results.map((r) => {
      const sub      = r.personalSubtotal + r.sharedSubtotal;
      const afterTax = sub * (1 + tax / 100);
      const total    = afterTax * (1 + tip / 100);
      const taxAmt   = afterTax - sub;
      const tipAmt   = total - afterTax;
      const name     = r.name || "Unnamed";
      const lines    = [`👤 ${name}`];
      if (r.personalSubtotal > 0) lines.push(`  Personal items:   ${fmt(r.personalSubtotal)}`);
      if (r.sharedSubtotal   > 0) lines.push(`  Shared (split):   ${fmt(r.sharedSubtotal)}`);
      if (taxAmt             > 0) lines.push(`  Tax (${tax}%):        ${fmt(taxAmt)}`);
      if (tipAmt             > 0) lines.push(`  Tip (${tip}%):        ${fmt(tipAmt)}`);
      lines.push(`  ➡️ Owes: ${fmt(total)}`);
      return lines.join("\n");
    });

    return [
      "💰 Bill Split",
      line,
      rows.join("\n\n"),
      line,
      `Grand Total: ${fmt(grandTotal)}`,
    ].join("\n");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateExportText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddToExpenses = () => {
    if (!onSaveExpense || addedToExpenses) return;
    const today = new Date().toISOString().slice(0, 10);
    const round2 = (n) => Math.round(n * 100) / 100;
    onSaveExpense({
      id:       crypto.randomUUID(),
      name:     "Bill Split",
      amount:   round2(grandTotal),
      currency: "USD",
      type:     "expense",
      category: "other",
      date:     today,
      billSplit: {
        people: results
          .filter((r) => !r.isSelf)
          .map((r) => {
            const sub   = r.personalSubtotal + r.sharedSubtotal;
            const total = sub * (1 + tax / 100) * (1 + tip / 100);
            return { id: r.id, name: r.name || "Unnamed", owes: round2(total), received: false };
          }),
      },
    });
    setAddedToExpenses(true);
  };

  return (
    <div style={{ ...s.page, padding: isMobile ? "16px" : "32px 28px", paddingBottom: isMobile ? 88 : "32px" }}>
      <div style={s.header}>
        <h1 style={s.title}>Bill Splitter</h1>
        <p style={s.sub}>Split a bill with tax and tip fairly</p>
      </div>

      <div style={{ ...s.body, gridTemplateColumns: isMobile ? "1fr" : "1fr 380px" }}>
        <div style={s.left}>

          {/* People */}
          <Section title="People">
            <div style={s.stack}>
              {people.map((p) => (
                <div key={p.id} style={s.personRow}>
                  <span style={s.personIcon}><IconUser /></span>
                  <input
                    style={{ ...s.input, flex: 1 }}
                    value={p.name}
                    onChange={(e) => updatePersonName(p.id, e.target.value)}
                    placeholder="Name"
                  />
                  <button
                    onClick={() => toggleSelf(p.id)}
                    title={p.isSelf ? "Remove self mark" : "Mark as self (no payment tracking)"}
                    style={{
                      ...s.iconBtn,
                      background: p.isSelf ? "#E8F5E9" : "transparent",
                      color:      p.isSelf ? "#2E7D32" : "#C5BFB5",
                      border:     p.isSelf ? "1px solid #A5D6A7" : "1px solid transparent",
                      borderRadius: 6, fontSize: 11, fontWeight: 700,
                      padding: "4px 8px", gap: 4,
                    }}
                  >
                    {p.isSelf ? <IconCheck /> : null}
                    Me
                  </button>
                  {people.length > 1 && (
                    <button style={s.iconBtn} onClick={() => removePerson(p.id)}><IconTrash /></button>
                  )}
                </div>
              ))}
              <button style={s.addBtn} onClick={addPerson}>
                <IconPlus /> Add Person
              </button>
            </div>
          </Section>

          {/* Tax & Tip */}
          <Section title="Tax & Tip">
            <div style={s.rateRow}>
              <div style={s.rateField}>
                <label style={s.label}>Tax Rate (%)</label>
                <input
                  style={s.input}
                  type="number" min="0" max="100" step="0.1" placeholder="e.g. 8.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>
              <div style={s.rateField}>
                <label style={s.label}>Tip Rate (%)</label>
                <input
                  style={s.input}
                  type="number" min="0" max="100" step="0.5" placeholder="e.g. 18"
                  value={tipRate}
                  onChange={(e) => setTipRate(e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* Shared Items */}
          <Section title="Shared Items">
            <div style={s.stack}>
              {sharedItems.length === 0 && (
                <p style={s.empty}>No shared items yet</p>
              )}
              {sharedItems.map((item) => (
                <div key={item.id} style={s.itemRow}>
                  <input
                    style={{ ...s.input, flex: 2 }}
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateSharedItem(item.id, "description", e.target.value)}
                  />
                  <div style={s.inputPrefix}>
                    <span style={s.prefix}>$</span>
                    <input
                      style={{ ...s.input, ...s.inputInner }}
                      type="number" min="0" step="0.01" placeholder="0.00"
                      value={item.amount}
                      onChange={(e) => updateSharedItem(item.id, "amount", e.target.value)}
                    />
                  </div>
                  <div style={s.countWrap}>
                    <span style={s.countLabel}>×</span>
                    <input
                      style={{ ...s.input, width: 52, textAlign: "center" }}
                      type="number" min="1" step="1" placeholder="1"
                      value={item.count}
                      onChange={(e) => updateSharedItem(item.id, "count", e.target.value)}
                    />
                  </div>
                  <button style={s.iconBtn} onClick={() => removeSharedItem(item.id)}><IconTrash /></button>
                </div>
              ))}
              <button style={s.addBtn} onClick={addSharedItem}>
                <IconPlus /> Add Shared Item
              </button>
            </div>
          </Section>

          {/* Personal Items per person */}
          <Section title="Personal Items">
            {people.map((person) => {
              const items = personalItems.filter((i) => i.personId === person.id);
              return (
                <div key={person.id} style={s.personBlock}>
                  <div style={s.personBlockHeader}>
                    <span style={s.personBlockName}>{person.name || "Unnamed"}</span>
                    <button style={s.addBtnSmall} onClick={() => addPersonalItem(person.id)}>
                      <IconPlus /> Add Item
                    </button>
                  </div>
                  {items.length === 0 && <p style={s.emptySmall}>No personal items</p>}
                  {items.map((item) => (
                    <div key={item.id} style={s.itemRow}>
                      <input
                        style={{ ...s.input, flex: 2 }}
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updatePersonalItem(item.id, "description", e.target.value)}
                      />
                      <div style={s.inputPrefix}>
                        <span style={s.prefix}>$</span>
                        <input
                          style={{ ...s.input, ...s.inputInner }}
                          type="number" min="0" step="0.01" placeholder="0.00"
                          value={item.amount}
                          onChange={(e) => updatePersonalItem(item.id, "amount", e.target.value)}
                        />
                      </div>
                      <div style={s.countWrap}>
                        <span style={s.countLabel}>×</span>
                        <input
                          style={{ ...s.input, width: 52, textAlign: "center" }}
                          type="number" min="1" step="1" placeholder="1"
                          value={item.count}
                          onChange={(e) => updatePersonalItem(item.id, "count", e.target.value)}
                        />
                      </div>
                      <button style={s.iconBtn} onClick={() => removePersonalItem(item.id)}><IconTrash /></button>
                    </div>
                  ))}
                </div>
              );
            })}
          </Section>

          <button style={s.calcBtn} onClick={() => setShowResults(true)}>
            Calculate Split
          </button>
        </div>

        {/* Results panel */}
        <div style={{ ...s.right, position: isMobile ? "static" : "sticky" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ ...s.sectionTitle, margin: 0 }}>Results</h3>
            {showResults && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
                    background: copied ? "#E8F5E9" : "#F5F0E8",
                    color:      copied ? "#2E7D32" : "#6B6780",
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  {copied ? <IconCheck /> : <IconCopy />}
                  {copied ? "Copied!" : "Copy for chat"}
                </button>
                {onSaveExpense && (
                  <button
                    onClick={handleAddToExpenses}
                    disabled={addedToExpenses}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 8, border: "none",
                      cursor: addedToExpenses ? "default" : "pointer",
                      fontSize: 12, fontWeight: 600,
                      background: addedToExpenses ? "#E8F5E9" : "#E8654A",
                      color:      addedToExpenses ? "#2E7D32" : "#fff",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {addedToExpenses ? <IconCheck /> : null}
                    {addedToExpenses ? "Added to Expenses" : "+ Add to Expenses"}
                  </button>
                )}
              </div>
            )}
          </div>
          {!showResults ? (
            <p style={s.empty}>Fill in the details and click Calculate Split</p>
          ) : (
            <>
              <div style={s.stack}>
                {results.map((r) => (
                  <ResultCard
                    key={r.id}
                    name={r.name || "Unnamed"}
                    personalSubtotal={r.personalSubtotal}
                    sharedSubtotal={r.sharedSubtotal}
                    taxRate={tax}
                    tipRate={tip}
                  />
                ))}
              </div>
              <div style={s.grandTotal}>
                <span>Grand Total</span>
                <span style={s.grandTotalAmt}>{fmt(grandTotal)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
  page:   { padding: "32px 28px", display: "flex", flexDirection: "column", gap: 24, flex: 1, overflowY: "auto" },
  header: {},
  title:  { fontSize: 32, fontWeight: 700, margin: 0, color: "#1a1a2e", letterSpacing: "-0.5px" },
  sub:    { fontSize: 14, color: "#9B97A8", margin: "4px 0 0" },

  body:  { display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" },
  left:  { display: "flex", flexDirection: "column", gap: 20 },
  right: { background: "#fff", border: "1px solid #E8E0D0", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 0 },

  section:      { background: "#fff", border: "1px solid #E8E0D0", borderRadius: 16, padding: 24 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "#1a1a2e", margin: "0 0 16px" },

  stack: { display: "flex", flexDirection: "column", gap: 10 },

  input: {
    border: "1px solid #E8E0D0", borderRadius: 8, padding: "8px 10px",
    fontSize: 13, color: "#1a1a2e", background: "#FAFAF8", outline: "none",
    width: "100%", boxSizing: "border-box",
  },
  inputPrefix: { position: "relative", display: "flex", alignItems: "center", flex: 1 },
  prefix:      { position: "absolute", left: 10, fontSize: 13, color: "#9B97A8", pointerEvents: "none" },
  inputInner:  { paddingLeft: 20, width: "100%" },

  label: { fontSize: 12, fontWeight: 600, color: "#9B97A8", letterSpacing: "0.4px", display: "block", marginBottom: 6 },

  personRow:  { display: "flex", alignItems: "center", gap: 8 },
  personIcon: { color: "#9B97A8", display: "flex", flexShrink: 0 },

  itemRow:  { display: "flex", alignItems: "center", gap: 8 },
  countWrap: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 },
  countLabel: { fontSize: 14, color: "#9B97A8" },

  rateRow:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  rateField: { display: "flex", flexDirection: "column" },

  personBlock:       { marginBottom: 16 },
  personBlockHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  personBlockName:   { fontSize: 13, fontWeight: 700, color: "#1a1a2e" },

  iconBtn: {
    background: "none", border: "none", cursor: "pointer", padding: 6,
    color: "#9B97A8", borderRadius: 6, display: "flex", alignItems: "center",
    flexShrink: 0,
  },
  addBtn: {
    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
    background: "#F5F0E8", border: "none", borderRadius: 8, cursor: "pointer",
    fontSize: 13, color: "#6B6780", fontWeight: 600, alignSelf: "flex-start",
  },
  addBtnSmall: {
    display: "flex", alignItems: "center", gap: 4, padding: "5px 10px",
    background: "#F5F0E8", border: "none", borderRadius: 6, cursor: "pointer",
    fontSize: 12, color: "#6B6780", fontWeight: 600,
  },
  calcBtn: {
    padding: "12px 28px", background: "#E8654A", color: "#fff", border: "none",
    borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
    alignSelf: "flex-start",
  },

  empty:      { fontSize: 13, color: "#9B97A8", margin: 0 },
  emptySmall: { fontSize: 12, color: "#C5BFB5", margin: "4px 0 0" },

  resultCard: {
    border: "1px solid #E8E0D0", borderRadius: 12, padding: 16,
    display: "flex", flexDirection: "column", gap: 10,
  },
  resultName:   { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#1a1a2e" },
  resultAvatar: { width: 28, height: 28, borderRadius: "50%", background: "#E8654A15", display: "flex", alignItems: "center", justifyContent: "center", color: "#E8654A", flexShrink: 0 },
  resultRows:   { display: "flex", flexDirection: "column", gap: 4 },
  resultRow:    { display: "flex", justifyContent: "space-between", fontSize: 12 },
  resultLabel:  { color: "#9B97A8" },
  resultVal:    { color: "#1a1a2e", fontWeight: 600 },
  resultTotal:  { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F0ECE8", paddingTop: 10, fontSize: 13, fontWeight: 700, color: "#1a1a2e" },
  resultTotalAmt: { fontSize: 18, color: "#E8654A" },

  grandTotal:    { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #E8E0D0", paddingTop: 16, fontSize: 14, fontWeight: 700, color: "#1a1a2e" },
  grandTotalAmt: { fontSize: 22, color: "#E8654A", fontWeight: 800 },
};
