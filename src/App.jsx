import { useState, useRef, useEffect } from "react";
import {
  getDaysInMonth, getFirstDayOfMonth, toKey, MONTHS, MONTHS_SHORT, MONTHS_FULL, DAYS_FULL, getEventsForDate,
} from "./utils/dateHelpers";
import { useOutsideClose, useIsMobile } from "./utils/hooks";
import CalendarGrid from "./components/CalendarGrid";
import WeekView from "./components/WeekView";
import YearView from "./components/YearView";
import EventModal from "./components/EventModal";
import CreateEventModal from "./components/CreateEventModal";
import ExportModal from "./components/ExportModal";
import SubscribeModal from "./components/SubscribeModal";
import ExpensesPage from "./components/ExpensesPage";
import Dashboard from "./components/Dashboard";
import BillSplitter from "./components/BillSplitter";
import { supabase, eventToDb, rowsToDict, expenseToDb } from "./lib/supabase";
import AuthPage from "./components/AuthPage";

// ── Month-Year Picker ──────────────────────────────────────────────────────
function MonthYearPicker({ year, month, onSelect, onClose }) {
  const [pickerYear, setPickerYear] = useState(year);
  const today = new Date();
  return (
    <div style={pickerSt.box}>
      <div style={pickerSt.nav}>
        <button style={pickerSt.navBtn} onClick={() => setPickerYear((y) => y - 1)}>‹</button>
        <span style={pickerSt.label}>{pickerYear}</span>
        <button style={pickerSt.navBtn} onClick={() => setPickerYear((y) => y + 1)}>›</button>
      </div>
      <div style={pickerSt.grid}>
        {MONTHS_SHORT.map((label, m) => {
          const isSelected = m === month && pickerYear === year;
          const isToday    = m === today.getMonth() && pickerYear === today.getFullYear();
          return (
            <button
              key={m}
              onClick={() => { onSelect(pickerYear, m); onClose(); }}
              style={{
                ...pickerSt.cell,
                background: isSelected ? "#E8654A" : isToday ? "#E8654A15" : "transparent",
                color:      isSelected ? "#fff"    : isToday ? "#E8654A"   : "#1a1a2e",
                border:     isToday && !isSelected ? "1px solid #E8654A55" : "1px solid transparent",
                fontWeight: isSelected || isToday ? 700 : 400,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Year Picker ────────────────────────────────────────────────────────────
function YearPicker({ year, onSelect, onClose }) {
  const base = Math.floor(year / 10) * 10;
  const [decade, setDecade] = useState(base);
  const today = new Date();
  const years = Array.from({ length: 12 }, (_, i) => decade - 1 + i);
  return (
    <div style={pickerSt.box}>
      <div style={pickerSt.nav}>
        <button style={pickerSt.navBtn} onClick={() => setDecade((d) => d - 10)}>‹</button>
        <span style={pickerSt.label}>{decade} – {decade + 9}</span>
        <button style={pickerSt.navBtn} onClick={() => setDecade((d) => d + 10)}>›</button>
      </div>
      <div style={pickerSt.grid}>
        {years.map((y) => {
          const isSelected = y === year;
          const isNow      = y === today.getFullYear();
          const isDim      = y < decade || y > decade + 9;
          return (
            <button
              key={y}
              onClick={() => { onSelect(y); onClose(); }}
              style={{
                ...pickerSt.cell,
                opacity:    isDim ? 0.35 : 1,
                background: isSelected ? "#E8654A" : isNow ? "#E8654A15" : "transparent",
                color:      isSelected ? "#fff"    : isNow ? "#E8654A"   : "#1a1a2e",
                border:     isNow && !isSelected ? "1px solid #E8654A55" : "1px solid transparent",
                fontWeight: isSelected || isNow ? 700 : 400,
              }}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────
function IconGrid()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>; }
function IconCalendar() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconDollar()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function IconSplit()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 00-1.172-2.872L3 3"/><path d="M20.8 20.8L14 14"/></svg>; }
function IconLogout()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function IconEdit()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function IconTrash()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>; }
function IconClock()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function IconUpload()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>; }
function IconDownload() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
function IconLink()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>; }

// ── Bottom Nav (mobile) ────────────────────────────────────────────────────
function BottomNav({ activeNav, onNavChange }) {
  const items = [
    { id: "dashboard",    label: "Home",     Icon: IconGrid },
    { id: "schedule",     label: "Schedule", Icon: IconCalendar },
    { id: "expenses",     label: "Expenses", Icon: IconDollar },
    { id: "billsplitter", label: "Split",    Icon: IconSplit },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
      background: "#fff", borderTop: "1px solid #E8E0D0",
      display: "flex", paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {items.map(({ id, label, Icon }) => {
        const active = activeNav === id;
        return (
          <button
            key={id}
            onClick={() => onNavChange(id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "10px 0", background: "none", border: "none", cursor: "pointer",
              color: active ? "#E8654A" : "#9B97A8",
            }}
          >
            <Icon />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ activeNav, onNavChange, onSignOut }) {
  const items = [
    { id: "dashboard",    label: "Dashboard",    Icon: IconGrid },
    { id: "schedule",     label: "Schedule",     Icon: IconCalendar },
    { id: "expenses",     label: "Expenses",     Icon: IconDollar },
    { id: "billsplitter", label: "Bill Splitter", Icon: IconSplit },
  ];
  return (
    <aside style={sStyles.root}>
      <div style={sStyles.brand}>
        <div style={sStyles.logo}>ChronoSpend</div>
        <div style={sStyles.tagline}>SCHEDULE · SPEND · SIMPLIFY</div>
      </div>
      <nav style={sStyles.nav}>
        {items.map(({ id, label, Icon }) => {
          const active = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => onNavChange(id)}
              style={{ ...sStyles.item, ...(active ? sStyles.itemActive : {}) }}
            >
              <span style={{ color: active ? "#fff" : "#9B97A8", display: "flex", alignItems: "center" }}>
                <Icon />
              </span>
              {label}
            </button>
          );
        })}
      </nav>
      <button style={sStyles.signOut} onClick={onSignOut}>
        <span style={{ color: "#9B97A8", display: "flex", alignItems: "center" }}><IconLogout /></span>
        Sign Out
      </button>
    </aside>
  );
}

// ── Day Detail Panel ────────────────────────────────────────────────────────
function DayDetailPanel({ selectedDate, events, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  if (!selectedDate) {
    return (
      <aside style={pStyles.root}>
        <p style={pStyles.placeholder}>Select a day to view events</p>
      </aside>
    );
  }

  const [y, m, d] = selectedDate.split("-").map(Number);
  const dateObj   = new Date(y, m - 1, d);
  const dayName   = DAYS_FULL[dateObj.getDay()];
  const dayEvents = getEventsForDate(events, selectedDate);

  return (
    <aside style={pStyles.root}>
      <div style={pStyles.dateHead}>
        <div style={pStyles.dayName}>{dayName}</div>
        <div style={pStyles.fullDate}>{MONTHS_FULL[m - 1]} {d}, {y}</div>
      </div>
      <div style={pStyles.list}>
        {dayEvents.length === 0 ? (
          <p style={pStyles.empty}>No events this day</p>
        ) : (
          dayEvents.map((ev) => (
            <div key={ev.id} style={pStyles.card}>
              <div style={pStyles.cardTop}>
                <span style={pStyles.cardTitle}>{ev.title}</span>
                {confirmId === ev.id ? (
                  <div style={pStyles.confirmRow}>
                    <span style={pStyles.confirmText}>Delete?</span>
                    <button style={pStyles.confirmCancel} onClick={() => setConfirmId(null)}>Cancel</button>
                    <button style={pStyles.confirmDelete} onClick={() => { setConfirmId(null); onDelete(ev.id, ev.date); }}>Delete</button>
                  </div>
                ) : (
                  <div style={pStyles.actions}>
                    <button style={pStyles.actionBtn} onClick={() => onEdit(ev)} title="Edit">
                      <IconEdit />
                    </button>
                    <button
                      style={{ ...pStyles.actionBtn, color: "#E8654A" }}
                      onClick={() => setConfirmId(ev.id)}
                      title="Delete"
                    >
                      <IconTrash />
                    </button>
                  </div>
                )}
              </div>
              {ev.time && (
                <div style={pStyles.timeRow}>
                  <IconClock />
                  <span style={{ marginLeft: 5 }}>{ev.time}</span>
                </div>
              )}
              {ev.desc && (
                <span style={pStyles.tag}>{ev.desc.slice(0, 18)}</span>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const today    = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [user,         setUser]         = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);
  const [view,         setView]         = useState("month");
  const [year,         setYear]         = useState(today.getFullYear());
  const [month,        setMonth]        = useState(today.getMonth());
  const [events,       setEvents]       = useState({});
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [activeNav,    setActiveNav]    = useState("dashboard");
  const [expenses,     setExpenses]     = useState([]);

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session) { setEvents({}); setExpenses([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load from Supabase when user is set ─────────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase.from("events").select("*").eq("user_id", user.id).then(({ data, error }) => {
      if (error) console.error("Failed to load events:", error.message);
      else if (data) setEvents(rowsToDict(data));
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase.from("expenses").select("*").eq("user_id", user.id).then(({ data, error }) => {
      if (error) console.error("Failed to load expenses:", error.message);
      else if (data) setExpenses(data.map((r) => ({ id: r.id, name: r.name, amount: r.amount, currency: r.currency || "USD", type: r.type || "expense", date: r.date, category: r.category, ...(r.bill_split ? { billSplit: r.bill_split } : {}) })));
    });
  }, [user]);

  const saveExpense = (ex) => {
    setExpenses((prev) => {
      const idx = prev.findIndex((e) => e.id === ex.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = ex; return next; }
      return [...prev, ex];
    });
    supabase.from("expenses").upsert({ ...expenseToDb(ex), user_id: user.id }).then(({ error }) => {
      if (error) console.error("Failed to save expense:", error.message);
    });
  };
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    supabase.from("expenses").delete().eq("id", id).then(({ error }) => {
      if (error) console.error("Failed to delete expense:", error.message);
    });
  };
  const [modal,        setModal]        = useState(null);
  const [createModal,  setCreateModal]  = useState(null);
  const [exportModal,    setExportModal]    = useState(false);
  const [subscribeModal, setSubscribeModal] = useState(false);
  const [dragData,     setDragData]     = useState(null);
  const [pickerOpen,   setPickerOpen]   = useState(false);

  const titleRef  = useRef(null);
  const pickerRef = useRef(null);
  useOutsideClose([titleRef, pickerRef], () => setPickerOpen(false));

  // Week anchor — Sunday of the displayed week
  const [weekAnchor, setWeekAnchor] = useState(() => {
    const d   = today.getDate() - today.getDay();
    const sun = new Date(today.getFullYear(), today.getMonth(), d);
    return toKey(sun.getFullYear(), sun.getMonth(), sun.getDate());
  });

  const getWeekDays = (anchor) => {
    const [y, m, d] = anchor.split("-").map(Number);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(y, m - 1, d + i);
      return {
        year: date.getFullYear(), month: date.getMonth(), day: date.getDate(),
        key: toKey(date.getFullYear(), date.getMonth(), date.getDate()),
      };
    });
  };
  const weekDays = getWeekDays(weekAnchor);

  // View switching
  const changeView = (newView) => {
    if (newView === "week" && view !== "week") {
      const t   = new Date(year, month, 1);
      const sun = new Date(t.getFullYear(), t.getMonth(), t.getDate() - t.getDay());
      setWeekAnchor(toKey(sun.getFullYear(), sun.getMonth(), sun.getDate()));
    } else if (newView === "month" && view === "week") {
      const [wy, wm] = weekAnchor.split("-").map(Number);
      setYear(wy); setMonth(wm - 1);
    }
    setView(newView);
  };

  // Navigation
  const prevPeriod = () => {
    if (view === "year") { setYear((y) => y - 1); }
    else if (view === "month") {
      if (month === 0) { setMonth(11); setYear((y) => y - 1); }
      else setMonth((m) => m - 1);
    } else {
      const [y, m, d] = weekAnchor.split("-").map(Number);
      const date = new Date(y, m - 1, d - 7);
      setWeekAnchor(toKey(date.getFullYear(), date.getMonth(), date.getDate()));
    }
  };

  const nextPeriod = () => {
    if (view === "year") { setYear((y) => y + 1); }
    else if (view === "month") {
      if (month === 11) { setMonth(0); setYear((y) => y + 1); }
      else setMonth((m) => m + 1);
    } else {
      const [y, m, d] = weekAnchor.split("-").map(Number);
      const date = new Date(y, m - 1, d + 7);
      setWeekAnchor(toKey(date.getFullYear(), date.getMonth(), date.getDate()));
    }
  };

  // Calendar header title
  const getHeaderTitle = () => {
    if (view === "year") return String(year);
    if (view === "month") return `${MONTHS[month]} ${year}`;
    const first = weekDays[0], last = weekDays[6];
    const fm = MONTHS[first.month].slice(0, 3), lm = MONTHS[last.month].slice(0, 3);
    if (first.month === last.month && first.year === last.year)
      return `${fm} ${first.day} – ${last.day}, ${first.year}`;
    if (first.year === last.year)
      return `${fm} ${first.day} – ${lm} ${last.day}, ${first.year}`;
    return `${fm} ${first.day}, ${first.year} – ${lm} ${last.day}, ${last.year}`;
  };

  // Build month grid cells
  const daysInMonth    = getDaysInMonth(year, month);
  const firstDay       = getFirstDayOfMonth(year, month);
  const prevMonthDays  = getDaysInMonth(year, month === 0 ? 11 : month - 1);
  const cells = [];
  const prevM = month === 0 ? 11 : month - 1, prevY = month === 0 ? year - 1 : year;
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: prevMonthDays - i, month: prevM, year: prevY, current: false });
  for (let dd = 1; dd <= daysInMonth; dd++)
    cells.push({ day: dd, month, year, current: true });
  const nextM = month === 11 ? 0 : month + 1, nextY = month === 11 ? year + 1 : year;
  for (let dd = 1; dd <= 42 - cells.length; dd++)
    cells.push({ day: dd, month: nextM, year: nextY, current: false });

  // Event CRUD
  const saveEvent = (ev) => {
    setEvents((prev) => {
      const next = { ...prev };
      for (const [dateKey, evArr] of Object.entries(next)) {
        const idx = evArr.findIndex((e) => e.id === ev.id);
        if (idx >= 0) {
          if (dateKey !== ev.date) {
            const updated = evArr.filter((e) => e.id !== ev.id);
            if (updated.length) next[dateKey] = updated; else delete next[dateKey];
          }
          break;
        }
      }
      const dayEvents = [...(next[ev.date] || [])];
      const idx = dayEvents.findIndex((e) => e.id === ev.id);
      if (idx >= 0) dayEvents[idx] = ev; else dayEvents.push(ev);
      dayEvents.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
      next[ev.date] = dayEvents;
      return next;
    });
    supabase.from("events").upsert({ ...eventToDb(ev), user_id: user.id }).then(({ error }) => {
      if (error) console.error("Failed to save event:", error.message);
    });
    setModal(null);
  };

  const deleteEvent = (id, date) => {
    setEvents((prev) => {
      const dayEvents = (prev[date] || []).filter((e) => e.id !== id);
      const copy = { ...prev };
      if (dayEvents.length) copy[date] = dayEvents; else delete copy[date];
      return copy;
    });
    supabase.from("events").delete().eq("id", id).then(({ error }) => {
      if (error) console.error("Failed to delete event:", error.message);
    });
    setModal(null);
  };

  const saveBatchEvents = (evArray) => {
    setEvents((prev) => {
      const next = { ...prev };
      for (const ev of evArray) {
        const dayEvents = [...(next[ev.date] || [])];
        const idx = dayEvents.findIndex((e) => e.id === ev.id);
        if (idx >= 0) dayEvents[idx] = ev; else dayEvents.push(ev);
        dayEvents.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        next[ev.date] = dayEvents;
      }
      return next;
    });
    supabase.from("events").upsert(evArray.map((ev) => ({ ...eventToDb(ev), user_id: user.id }))).then(({ error }) => {
      if (error) console.error("Failed to save batch events:", error.message);
    });
  };

  const handleDragStart = (ev) => setDragData({ ev });
  const handleDrop = (toDate) => {
    if (!dragData) return;
    const { ev } = dragData;
    if (ev.date === toDate) return;
    let newEv = { ...ev, date: toDate };
    if (ev.endDate) {
      const diffDays = Math.round(
        (new Date(ev.endDate + "T00:00:00") - new Date(ev.date + "T00:00:00")) / 86400000
      );
      const newEnd = new Date(toDate + "T00:00:00");
      newEnd.setDate(newEnd.getDate() + diffDays);
      newEv.endDate = newEnd.toISOString().slice(0, 10);
    }
    deleteEvent(ev.id, ev.date);
    setTimeout(() => saveEvent(newEv), 0);
    setDragData(null);
  };

  const canPick = view === "month" || view === "year";
  const isMobile = useIsMobile();

  if (authLoading) return <div style={{ minHeight: "100vh", background: "#F5F0E8" }} />;
  if (!user) return <AuthPage />;

  const handleSignOut = () => supabase.auth.signOut();

  return (
    <div style={{ ...appSt.root, flexDirection: isMobile ? "column" : "row" }}>
      {!isMobile && <Sidebar activeNav={activeNav} onNavChange={setActiveNav} onSignOut={handleSignOut} />}

      {activeNav === "billsplitter" && <BillSplitter onSaveExpense={saveExpense} isMobile={isMobile} />}
      {activeNav === "dashboard" && <Dashboard events={events} expenses={expenses} isMobile={isMobile} onNavigateToEvent={(dateKey) => {
        const [y, m] = dateKey.split("-").map(Number);
        setYear(y);
        setMonth(m - 1);
        setSelectedDate(dateKey);
        setActiveNav("schedule");
      }} />}
      {activeNav === "expenses" && <ExpensesPage expenses={expenses} onSaveExpense={saveExpense} onDeleteExpense={deleteExpense} isMobile={isMobile} />}

      <div style={{ ...appSt.main, display: (activeNav === "expenses" || activeNav === "dashboard" || activeNav === "billsplitter") ? "none" : "flex", padding: isMobile ? "16px" : "32px 28px", paddingBottom: isMobile ? 80 : undefined }}>
        {/* ── Page Header ── */}
        <div style={{ ...appSt.pageHeader, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ ...appSt.pageTitle, fontSize: isMobile ? 24 : 32 }}>Schedule</h1>
            {!isMobile && <p style={appSt.pageSub}>Manage your events and appointments</p>}
          </div>
          <div style={{ ...appSt.headerActions, flexWrap: "wrap" }}>
            {!isMobile && (
              <button style={appSt.importBtn} onClick={() => setSubscribeModal(true)}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconLink /> Subscribe
                </span>
              </button>
            )}
            {!isMobile && (
              <button style={appSt.importBtn} onClick={() => setCreateModal({ defaultTab: "Import" })}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconUpload /> Import
                </span>
              </button>
            )}
            {!isMobile && (
              <button style={appSt.importBtn} onClick={() => setExportModal(true)}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconDownload /> Export
                </span>
              </button>
            )}
            <button style={appSt.newEventBtn} onClick={() => setCreateModal({ defaultDate: selectedDate })}>
              + New Event
            </button>
          </div>
        </div>

        {/* ── Content Row ── */}
        <div style={{ ...appSt.contentRow, flexDirection: isMobile ? "column" : "row" }}>
          {/* Calendar Card */}
          <div style={appSt.calCard}>
            {/* Calendar top bar: arrows + title + view toggle */}
            <div style={appSt.calTopBar}>
              <div style={appSt.calNavGroup}>
                <button style={appSt.navArrow} onClick={prevPeriod}>‹</button>
                <div style={{ position: "relative" }}>
                  <button
                    ref={titleRef}
                    style={{ ...appSt.calTitle, cursor: canPick ? "pointer" : "default" }}
                    onClick={() => canPick && setPickerOpen((o) => !o)}
                  >
                    {getHeaderTitle()}
                  </button>
                  {pickerOpen && view === "month" && (
                    <div ref={pickerRef} style={appSt.pickerDropdown}>
                      <MonthYearPicker
                        year={year} month={month}
                        onSelect={(y, m) => { setYear(y); setMonth(m); }}
                        onClose={() => setPickerOpen(false)}
                      />
                    </div>
                  )}
                  {pickerOpen && view === "year" && (
                    <div ref={pickerRef} style={appSt.pickerDropdown}>
                      <YearPicker
                        year={year}
                        onSelect={(y) => setYear(y)}
                        onClose={() => setPickerOpen(false)}
                      />
                    </div>
                  )}
                </div>
                <button style={appSt.navArrow} onClick={nextPeriod}>›</button>
              </div>

              <div style={appSt.viewToggle}>
                {["month", "week", "year"].map((v) => (
                  <button
                    key={v}
                    style={{ ...appSt.viewBtn, ...(view === v ? appSt.viewBtnActive : {}) }}
                    onClick={() => changeView(v)}
                  >
                    {v[0].toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Views */}
            {view === "month" && (
              <CalendarGrid
                cells={cells}
                events={events}
                selectedDate={selectedDate}
                onAdd={(date) => setSelectedDate(date)}
                onEdit={(ev) => { setSelectedDate(ev.date); setModal({ date: ev.date, event: ev }); }}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            )}
            {view === "week" && (
              <WeekView
                weekDays={weekDays}
                events={events}
                onAdd={(date) => setCreateModal({ defaultDate: date })}
                onEdit={(ev) => setModal({ date: ev.date, event: ev })}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            )}
            {view === "year" && (
              <YearView
                year={year}
                events={events}
                onMonthClick={(m) => { setMonth(m); setView("month"); }}
              />
            )}
          </div>

          {/* Day Detail Panel */}
          {!isMobile && (
            <DayDetailPanel
              selectedDate={selectedDate}
              events={events}
              onEdit={(ev) => setModal({ date: ev.date, event: ev })}
              onDelete={deleteEvent}
            />
          )}
        </div>
      </div>

      {modal && (
        <EventModal
          date={modal.date}
          event={modal.event}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={() => setModal(null)}
        />
      )}
      {createModal && (
        <CreateEventModal
          defaultDate={createModal.defaultDate}
          defaultTab={createModal.defaultTab}
          onSave={saveEvent}
          onSaveBatch={saveBatchEvents}
          onClose={() => setCreateModal(null)}
        />
      )}
      {exportModal && (
        <ExportModal
          events={events}
          onClose={() => setExportModal(false)}
        />
      )}
      {subscribeModal && (
        <SubscribeModal
          userId={user.id}
          onClose={() => setSubscribeModal(false)}
        />
      )}
      {isMobile && <BottomNav activeNav={activeNav} onNavChange={setActiveNav} />}
    </div>
  );
}

// ── Picker styles ──────────────────────────────────────────────────────────
const pickerSt = {
  box:    { padding: "14px 12px 10px", minWidth: 240 },
  nav:    { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  navBtn: {
    background: "#F0EDE8", border: "none", color: "#1a1a2e",
    width: 28, height: 28, borderRadius: 6, fontSize: 18,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  label:  { fontSize: 14, fontWeight: 700, color: "#1a1a2e" },
  grid:   { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 },
  cell:   { padding: "8px 4px", borderRadius: 8, fontSize: 13, cursor: "pointer", transition: "background 0.12s" },
};

// ── Sidebar styles ─────────────────────────────────────────────────────────
const sStyles = {
  root: {
    width: 220,
    flexShrink: 0,
    background: "#FFFFFF",
    borderRight: "1px solid #E8E0D0",
    display: "flex",
    flexDirection: "column",
    padding: "28px 16px",
    minHeight: "100vh",
  },
  brand: { marginBottom: 36, paddingLeft: 8 },
  logo:  { fontSize: 22, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.5px" },
  tagline: {
    fontSize: 9, fontWeight: 700, color: "#9B97A8",
    letterSpacing: "1px", marginTop: 3,
  },
  nav:  { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  item: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", borderRadius: 10,
    background: "transparent", border: "none",
    color: "#6B6780", fontSize: 14, fontWeight: 600,
    cursor: "pointer", textAlign: "left",
    transition: "background 0.15s, color 0.15s",
  },
  itemActive: { background: "#E8654A", color: "#fff" },
  signOut: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", borderRadius: 10,
    background: "transparent", border: "none",
    color: "#9B97A8", fontSize: 14, fontWeight: 600,
    cursor: "pointer", marginTop: 12,
  },
};

// ── Day Detail Panel styles ────────────────────────────────────────────────
const pStyles = {
  root: {
    width: 280,
    flexShrink: 0,
    background: "#FFFFFF",
    border: "1px solid #E8E0D0",
    borderRadius: 16,
    padding: "24px 20px",
    alignSelf: "flex-start",
  },
  placeholder: { fontSize: 13, color: "#9B97A8", textAlign: "center", marginTop: 40 },
  dateHead:  { marginBottom: 20 },
  dayName:   { fontSize: 22, fontWeight: 700, color: "#1a1a2e" },
  fullDate:  { fontSize: 13, color: "#9B97A8", marginTop: 2 },
  list:      { display: "flex", flexDirection: "column", gap: 12 },
  empty:     { fontSize: 13, color: "#9B97A8", margin: 0 },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E8E0D0",
    borderRadius: 12,
    padding: "14px 14px 12px",
  },
  cardTop:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.3 },
  actions:   { display: "flex", gap: 6, flexShrink: 0 },
  confirmRow: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  confirmText: { fontSize: 12, fontWeight: 600, color: "#E8654A" },
  confirmCancel: {
    background: "none", border: "1px solid #E8E0D0", borderRadius: 6,
    fontSize: 11, fontWeight: 600, color: "#6B6780", padding: "3px 8px", cursor: "pointer",
  },
  confirmDelete: {
    background: "#E8654A", border: "none", borderRadius: 6,
    fontSize: 11, fontWeight: 600, color: "#fff", padding: "3px 8px", cursor: "pointer",
  },
  actionBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#9B97A8", display: "flex", alignItems: "center",
    padding: 3, borderRadius: 4, transition: "color 0.12s",
  },
  timeRow: {
    display: "flex", alignItems: "center",
    fontSize: 12, color: "#9B97A8", marginBottom: 8,
  },
  tag: {
    display: "inline-block",
    fontSize: 11, fontWeight: 600, color: "#6B6780",
    background: "#F0EDE8", borderRadius: 20,
    padding: "3px 10px",
  },
};

// ── App / page styles ──────────────────────────────────────────────────────
const appSt = {
  root: {
    "--cell-bg":        "#ffffff",
    "--cell-bg-muted":  "#F9F6F1",
    "--surface":        "#ffffff",
    "--text":           "#1a1a2e",
    "--text-secondary": "#8B8599",
    "--border":         "#E8E0D0",
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    background: "#F5F0E8",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row",
    color: "#1a1a2e",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "32px 28px",
    minWidth: 0,
    gap: 24,
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pageTitle: { fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: "-0.5px", color: "#1a1a2e" },
  pageSub:   { fontSize: 13, color: "#9B97A8", margin: "4px 0 0" },
  headerActions: { display: "flex", gap: 10, alignItems: "center" },
  importBtn: {
    background: "#fff", border: "1px solid #E8E0D0", color: "#1a1a2e",
    borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    transition: "background 0.15s",
  },
  newEventBtn: {
    background: "#E8654A", border: "none", color: "#fff",
    borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 700,
    cursor: "pointer", transition: "opacity 0.15s",
  },
  contentRow: {
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
    flex: 1,
  },
  calCard: {
    flex: 1,
    background: "#FFFFFF",
    border: "1px solid #E8E0D0",
    borderRadius: 16,
    overflow: "hidden",
    minWidth: 0,
  },
  calTopBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #E8E0D0",
  },
  calNavGroup: { display: "flex", alignItems: "center", gap: 10 },
  navArrow: {
    background: "none", border: "1px solid #E8E0D0", color: "#1a1a2e",
    width: 32, height: 32, borderRadius: 8, fontSize: 18,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.15s",
  },
  calTitle: {
    fontSize: 18, fontWeight: 700, color: "#1a1a2e",
    background: "none", border: "none", padding: "0 4px",
    userSelect: "none",
  },
  pickerDropdown: {
    position: "absolute", top: "calc(100% + 8px)", left: 0,
    zIndex: 600, background: "#FFFFFF",
    border: "1px solid #E8E0D0", borderRadius: 14,
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  },
  viewToggle: {
    display: "flex", background: "#F5F0E8",
    border: "1px solid #E8E0D0", borderRadius: 8, overflow: "hidden",
  },
  viewBtn: {
    background: "transparent", color: "#8B8599", border: "none",
    padding: "7px 14px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "background 0.15s, color 0.15s",
  },
  viewBtnActive: { background: "#E8654A", color: "#fff" },
};
