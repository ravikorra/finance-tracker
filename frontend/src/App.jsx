import { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { Dashboard } from './components/Dashboard/Dashboard';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorMessage } from './components/common/ErrorMessage';
import { useInvestments } from './hooks/useInvestments';
import { useExpenses } from './hooks/useExpenses';
import { useSettings } from './hooks/useSettings';
import { formatCurrency, getTodayDate } from './utils/formatters';
import { api } from './api';
import './App.css';

// Legacy helper for backwards compatibility
const fmt = formatCurrency;
const today = getTodayDate;

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  // ----- STATE VARIABLES -----
  const [tab, setTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Form data for investments
  const [invForm, setInvForm] = useState({
    name: '', type: 'Mutual Fund', invested: '', current: '', date: today()
  });
  
  // Form data for expenses
  const [expForm, setExpForm] = useState({
    desc: '', amount: '', category: 'Food', date: today(), addedBy: 'Ravi'
  });

  // Custom hooks for data management
  const {
    investments,
    loading: investmentsLoading,
    error: investmentsError,
    fetchInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  } = useInvestments();

  const {
    expenses,
    loading: expensesLoading,
    error: expensesError,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    fetchSettings,
  } = useSettings();

  // ----- LOAD DATA ON START -----
  useEffect(() => {
    loadData();
  }, []);

  // Fetch all data from backend
  const loadData = async () => {
    setIsInitialLoading(true);
    setGlobalError(null);

    try {
      // Check if backend is available first
      const isBackendHealthy = await api.checkHealth();
      if (!isBackendHealthy) {
        throw new Error('⚠️ Backend server is not running. Please start the server on port 5000.');
      }

      // Load data in parallel
      await Promise.all([
        fetchInvestments(),
        fetchExpenses(),
        fetchSettings(),
      ]);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setIsInitialLoading(false);
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
        invested: parseFloat(invForm.invested),
        current: parseFloat(invForm.current) || parseFloat(invForm.invested),
        date: invForm.date
      };
      
      if (editingItem) {
        // UPDATE existing
        await updateInvestment(editingItem, data);
      } else {
        // CREATE new
        await addInvestment(data);
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
      invested: String(inv.invested),
      current: String(inv.current),
      date: inv.date
    });
    setEditingItem(inv.id);
    setShowForm('investment');
  };

  // Delete investment
  const deleteInv = async (id) => {
    if (!confirm('Delete this investment?')) return;
    await deleteInvestment(id);
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
        await updateExpense(editingItem, data);
      } else {
        await addExpense(data);
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
    await deleteExpense(id);
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

  // ----- RENDER UI -----

  // Safe arrays for rendering
  const invArray = Array.isArray(investments) ? investments : [];
  const expArray = Array.isArray(expenses) ? expenses : [];
  
  // Current month expenses for Expenses tab
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExp = expArray.filter(e => e.date?.startsWith(currentMonth));
  const totalMonthly = monthlyExp.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Show loading state
  if (isInitialLoading) return <LoadingSpinner message="Loading your financial data..." />;
  
  // Show error state
  if (globalError) return (
    <ErrorMessage 
      message={globalError} 
      onRetry={loadData}
    />
  );

  return (
    <div className="app">
      {/* HEADER */}
      <Header 
        onExport={handleExport}
        onImport={handleImport}
        onRefresh={loadData}
      />

      {/* NAVIGATION TABS */}
      <Navigation 
        activeTab={tab}
        onTabChange={setTab}
      />

      {/* Display any loading or error states from hooks */}
      {(investmentsError || expensesError || settingsError) && (
        <ErrorMessage 
          message={investmentsError || expensesError || settingsError}
        />
      )}

      {/* MAIN CONTENT */}
      <main>
        {/* ===== DASHBOARD TAB ===== */}
        {tab === 'dashboard' && (
          <Dashboard 
            investments={investments}
            expenses={expenses}
          />
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
                    {settings?.investmentTypes?.map(t => <option key={t}>{t}</option>)}
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
            <div className="items-grid">
              {invArray.map(inv => (
                <div key={inv.id} className="card item">
                  <div className="item-header">
                    <div>
                      <h4>{inv.name}</h4>
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
                    {settings?.categories?.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select
                    value={expForm.addedBy}
                    onChange={e => setExpForm({...expForm, addedBy: e.target.value})}
                  >
                    {settings?.members?.map(m => <option key={m}>{m}</option>)}
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
            <div className="items-grid">
              {expArray
                .sort((a, b) => b.date?.localeCompare(a.date)) // Newest first
                .map(exp => (
                  <div key={exp.id} className="card item">
                    <div className="item-header">
                      <div>
                        <h4>{exp.desc}</h4>
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
          </div>
        )}
      </main>
    </div>
  );
}
