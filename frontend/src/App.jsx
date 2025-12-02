import { useState, useEffect } from 'react';
import { api } from './api';
import './App.css';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Format number as Indian Rupees: 100000 -> ₹1,00,000
const fmt = (n) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

// Get today's date in YYYY-MM-DD format (for date inputs)
const today = () => new Date().toISOString().split('T')[0];

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  // ----- STATE VARIABLES -----
  // useState creates a variable that, when changed, re-renders the UI
  
  const [tab, setTab] = useState('dashboard');        // Current tab: dashboard/investments/expenses
  const [investments, setInvestments] = useState([]); // All investments from backend
  const [expenses, setExpenses] = useState([]);       // All expenses from backend
  const [settings, setSettings] = useState({          // App settings (categories, members)
    categories: [], investmentTypes: [], members: []
  });
  
  const [loading, setLoading] = useState(true);       // Show loading spinner
  const [error, setError] = useState(null);           // Error message if backend fails
  const [showForm, setShowForm] = useState(null);     // Which form to show: 'investment' or 'expense'
  const [editingItem, setEditingItem] = useState(null); // ID of item being edited (null = creating new)

  // Form data for investments
  const [invForm, setInvForm] = useState({
    name: '', type: 'Mutual Fund', invested: '', current: '', date: today()
  });
  
  // Form data for expenses
  const [expForm, setExpForm] = useState({
    desc: '', amount: '', category: 'Food', date: today(), addedBy: 'Ravi'
  });

  // ----- LOAD DATA ON START -----
  // useEffect runs code when component loads (like window.onload)
  useEffect(() => {
    loadData();
  }, []); // Empty array = run only once when app starts

  // Fetch all data from backend
  const loadData = async () => {
    try {
      setError(null);
      // Promise.all runs all 3 requests in parallel (faster)
      const [inv, exp, sett] = await Promise.all([
        api.getInvestments(),
        api.getExpenses(),
        api.getSettings()
      ]);
      setInvestments(inv || []);
      setExpenses(exp || []);
      setSettings(sett);
    } catch (err) {
      setError('Failed to connect to server. Is backend running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  // ----- INVESTMENT FUNCTIONS -----

  // Save new or update existing investment
  const saveInvestment = async () => {
    // Validate: name and invested amount required
    if (!invForm.name || !invForm.invested) return;
    
    try {
      const data = {
        name: invForm.name,
        type: invForm.type,
        invested: parseFloat(invForm.invested),        // Convert string to number
        current: parseFloat(invForm.current) || parseFloat(invForm.invested), // Default to invested
        date: invForm.date
      };
      
      if (editingItem) {
        // UPDATE existing
        const updated = await api.updateInvestment(editingItem, data);
        // Replace old item with updated one in state
        setInvestments(investments.map(i => i.id === editingItem ? updated : i));
      } else {
        // CREATE new
        const created = await api.createInvestment(data);
        setInvestments([...investments, created]); // Add to list
      }
      resetInvForm();
    } catch (err) {
      alert('Error saving investment');
    }
  };

  // Clear investment form and close it
  const resetInvForm = () => {
    setInvForm({ name: '', type: 'Mutual Fund', invested: '', current: '', date: today() });
    setEditingItem(null);
    setShowForm(null);
  };

  // Open form with existing data for editing
  const editInv = (inv) => {
    setInvForm({
      name: inv.name,
      type: inv.type,
      invested: String(inv.invested), // Convert number to string for input
      current: String(inv.current),
      date: inv.date
    });
    setEditingItem(inv.id);
    setShowForm('investment');
  };

  // Delete investment
  const deleteInv = async (id) => {
    if (!confirm('Delete this investment?')) return;
    await api.deleteInvestment(id);
    setInvestments(investments.filter(i => i.id !== id)); // Remove from state
  };

  // ----- EXPENSE FUNCTIONS (same pattern) -----

  const saveExpense = async () => {
    if (!expForm.desc || !expForm.amount) return;
    
    try {
      const data = {
        desc: expForm.desc,
        amount: parseFloat(expForm.amount),
        category: expForm.category,
        date: expForm.date,
        addedBy: expForm.addedBy
      };
      
      if (editingItem) {
        const updated = await api.updateExpense(editingItem, data);
        setExpenses(expenses.map(e => e.id === editingItem ? updated : e));
      } else {
        const created = await api.createExpense(data);
        setExpenses([...expenses, created]);
      }
      resetExpForm();
    } catch (err) {
      alert('Error saving expense');
    }
  };

  const resetExpForm = () => {
    setExpForm({ desc: '', amount: '', category: 'Food', date: today(), addedBy: 'Ravi' });
    setEditingItem(null);
    setShowForm(null);
  };

  const editExp = (exp) => {
    setExpForm({
      desc: exp.desc,
      amount: String(exp.amount),
      category: exp.category,
      date: exp.date,
      addedBy: exp.addedBy || 'Ravi'
    });
    setEditingItem(exp.id);
    setShowForm('expense');
  };

  const deleteExp = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await api.deleteExpense(id);
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // ----- EXPORT/IMPORT -----

  const handleExport = async () => {
    const data = await api.exportAll();
    // Create downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `finance-backup-${today()}.json`;
    a.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      await api.importAll(data);
      await loadData(); // Reload data
      alert('Import successful!');
    } catch {
      alert('Invalid file format');
    }
  };

  // ----- CALCULATIONS FOR DASHBOARD -----

  // Ensure arrays are valid before calculations
  const invArray = Array.isArray(investments) ? investments : [];
  const expArray = Array.isArray(expenses) ? expenses : [];

  // Total invested and current value
  const totalInvested = invArray.reduce((sum, i) => sum + (i.invested || 0), 0);
  const totalCurrent = invArray.reduce((sum, i) => sum + (i.current || 0), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : 0;

  // Current month expenses
  const currentMonth = new Date().toISOString().slice(0, 7); // "2024-01"
  const monthlyExp = expArray.filter(e => e.date?.startsWith(currentMonth));
  const totalMonthly = monthlyExp.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Group expenses by category
  const byCategory = monthlyExp.reduce((acc, e) => {
    if (e.category) {
      acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    }
    return acc;
  }, {});

  // Group expenses by family member
  const byMember = monthlyExp.reduce((acc, e) => {
    const member = e.addedBy || 'Unknown';
    acc[member] = (acc[member] || 0) + (e.amount || 0);
    return acc;
  }, {});

  // Group investments by type
  const byInvType = invArray.reduce((acc, i) => {
    if (!acc[i.type]) acc[i.type] = { invested: 0, current: 0 };
    acc[i.type].invested += i.invested || 0;
    acc[i.type].current += i.current || 0;
    return acc;
  }, {});

  // ----- RENDER UI -----

  // Show loading state
  if (loading) return <div className="loading">Loading...</div>;
  
  // Show error state
  if (error) return (
    <div className="error">
      {error}
      <br/>
      <button onClick={loadData}>Retry</button>
    </div>
  );

  return (
    <div className="app">
      {/* HEADER */}
      <header>
        <h1>💰 Finance Tracker</h1>
        <div className="actions">
          <button onClick={handleExport}>Export</button>
          <label className="btn">
            Import
            <input type="file" accept=".json" onChange={handleImport} hidden />
          </label>
          <button onClick={loadData}>↻</button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav>
        {['dashboard', 'investments', 'expenses'].map(t => (
          <button
            key={t}
            className={tab === t ? 'active' : ''}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <main>
        {/* ===== DASHBOARD TAB ===== */}
        {tab === 'dashboard' && (
          <div className="dashboard">
            {/* Net Worth Card */}
            <div className="card hero">
              <span className="label">Net Worth</span>
              <span className="value">{fmt(totalCurrent)}</span>
              <span className={totalGain >= 0 ? 'gain' : 'loss'}>
                {totalGain >= 0 ? '↑' : '↓'} {fmt(Math.abs(totalGain))} ({gainPct}%)
              </span>
            </div>

            {/* Summary Cards */}
            <div className="grid-2">
              <div className="card">
                <span className="label">Invested</span>
                <span className="value">{fmt(totalInvested)}</span>
              </div>
              <div className="card">
                <span className="label">This Month Spent</span>
                <span className="value loss">{fmt(totalMonthly)}</span>
              </div>
            </div>

            {/* Portfolio Allocation */}
            {Object.keys(byInvType).length > 0 && (
              <div className="card">
                <h3>Portfolio Allocation</h3>
                {Object.entries(byInvType).map(([type, v]) => (
                  <div key={type} className="row">
                    <span>{type}</span>
                    <span>
                      {fmt(v.current)}{' '}
                      <span className={v.current >= v.invested ? 'gain' : 'loss'}>
                        ({((v.current - v.invested) / v.invested * 100).toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Expenses by Category */}
            {Object.keys(byCategory).length > 0 && (
              <div className="card">
                <h3>Expenses by Category</h3>
                {Object.entries(byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amt]) => (
                    <div key={cat} className="row">
                      <span>{cat}</span>
                      <span>{fmt(amt)}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Expenses by Member */}
            {Object.keys(byMember).length > 0 && (
              <div className="card">
                <h3>Expenses by Member</h3>
                {Object.entries(byMember).map(([member, amt]) => (
                  <div key={member} className="row">
                    <span>{member}</span>
                    <span>{fmt(amt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== INVESTMENTS TAB ===== */}
        {tab === 'investments' && (
          <div className="list-view">
            <button className="add-btn" onClick={() => setShowForm('investment')}>
              + Add Investment
            </button>

            {/* Investment Form */}
            {showForm === 'investment' && (
              <div className="form card">
                <input
                  placeholder="Name (e.g., HDFC Flexi Cap)"
                  value={invForm.name}
                  onChange={e => setInvForm({...invForm, name: e.target.value})}
                />
                <div className="grid-2">
                  <select
                    value={invForm.type}
                    onChange={e => setInvForm({...invForm, type: e.target.value})}
                  >
                    {settings.investmentTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input
                    type="date"
                    value={invForm.date}
                    onChange={e => setInvForm({...invForm, date: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Invested ₹"
                    value={invForm.invested}
                    onChange={e => setInvForm({...invForm, invested: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Current ₹"
                    value={invForm.current}
                    onChange={e => setInvForm({...invForm, current: e.target.value})}
                  />
                </div>
                <div className="btn-row">
                  <button className="primary" onClick={saveInvestment}>
                    {editingItem ? 'Update' : 'Save'}
                  </button>
                  <button onClick={resetInvForm}>Cancel</button>
                </div>
              </div>
            )}

            {/* Investment List */}
            {invArray.map(inv => (
              <div key={inv.id} className="card item">
                <div className="item-header">
                  <div>
                    <strong>{inv.name}</strong>
                    <br/>
                    <small>{inv.type} • {inv.date}</small>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => editInv(inv)}>Edit</button>
                    <button className="danger" onClick={() => deleteInv(inv.id)}>Del</button>
                  </div>
                </div>
                <div className="item-footer">
                  <span>{fmt(inv.invested)} → {fmt(inv.current)}</span>
                  <span className={inv.current >= inv.invested ? 'gain' : 'loss'}>
                    {inv.current >= inv.invested ? '+' : ''}
                    {fmt(inv.current - inv.invested)} (
                    {((inv.current - inv.invested) / inv.invested * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== EXPENSES TAB ===== */}
        {tab === 'expenses' && (
          <div className="list-view">
            {/* Monthly Total */}
            <div className="card center">
              <span className="label">This Month</span>
              <span className="value loss">{fmt(totalMonthly)}</span>
            </div>

            <button className="add-btn" onClick={() => setShowForm('expense')}>
              + Add Expense
            </button>

            {/* Expense Form */}
            {showForm === 'expense' && (
              <div className="form card">
                <input
                  placeholder="Description"
                  value={expForm.desc}
                  onChange={e => setExpForm({...expForm, desc: e.target.value})}
                />
                <div className="grid-2">
                  <input
                    type="number"
                    placeholder="Amount ₹"
                    value={expForm.amount}
                    onChange={e => setExpForm({...expForm, amount: e.target.value})}
                  />
                  <select
                    value={expForm.category}
                    onChange={e => setExpForm({...expForm, category: e.target.value})}
                  >
                    {settings.categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select
                    value={expForm.addedBy}
                    onChange={e => setExpForm({...expForm, addedBy: e.target.value})}
                  >
                    {settings.members.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <input
                    type="date"
                    value={expForm.date}
                    onChange={e => setExpForm({...expForm, date: e.target.value})}
                  />
                </div>
                <div className="btn-row">
                  <button className="primary" onClick={saveExpense}>
                    {editingItem ? 'Update' : 'Save'}
                  </button>
                  <button onClick={resetExpForm}>Cancel</button>
                </div>
              </div>
            )}

            {/* Expense List */}
            {expArray
              .sort((a, b) => b.date?.localeCompare(a.date)) // Newest first
              .map(exp => (
                <div key={exp.id} className="card item">
                  <div className="item-header">
                    <div>
                      <strong>{exp.desc}</strong>
                      <br/>
                      <small>{exp.date} • {exp.category} • {exp.addedBy}</small>
                    </div>
                    <div className="item-actions">
                      <span className="amount">{fmt(exp.amount)}</span>
                      <button onClick={() => editExp(exp)}>Edit</button>
                      <button className="danger" onClick={() => deleteExp(exp.id)}>Del</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
