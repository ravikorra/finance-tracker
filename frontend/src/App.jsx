import { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { Dashboard } from './components/Dashboard/Dashboard';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorMessage } from './components/common/ErrorMessage';
import AutocompleteInput from './components/common/AutocompleteInput';
import { useInvestments } from './hooks/useInvestments';
import { useIncomes } from './hooks/useIncomes';
import { useExpenses } from './hooks/useExpenses';
import { useSettings } from './hooks/useSettings';
import { formatCurrency, getTodayDate } from './utils/formatters';
import { searchMutualFunds, getNAVOnDate, calculateUnits, refreshInvestmentNAV } from './utils/mfApi';
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
  
  // Month filter for tabs (YYYY-MM format)
  const getCurrentMonthString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());

  // Form data for investments
  const [invForm, setInvForm] = useState({
    name: '', type: 'Mutual Fund', invested: '', current: '', date: today(), schemeCode: '', units: 0, currentNAV: ''
  });
  
  // Form data for expenses
  const [expForm, setExpForm] = useState({
    desc: '', amount: '', category: 'Food', date: today(), addedBy: 'Ravi', paymentMethod: 'Online'
  });

  // Form data for incomes
  const [incForm, setIncForm] = useState({
    source: '', amount: '', category: 'Salary', date: today(), addedBy: 'Ravi', paymentMethod: 'Online'
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
    incomes,
    loading: incomesLoading,
    error: incomesError,
    refreshIncomes,
    addIncome,
    updateIncome,
    deleteIncome,
  } = useIncomes();

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
        refreshIncomes(),
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

  // Refresh NAV for all mutual fund investments
  const handleRefreshNAV = async () => {
    const mutualFunds = invArray.filter(inv => inv.type === 'Mutual Fund' && inv.schemeCode);
    
    if (mutualFunds.length === 0) {
      alert('No mutual funds with scheme codes found to refresh');
      return;
    }

    const confirmed = confirm(`Refresh NAV for ${mutualFunds.length} mutual fund(s)?`);
    if (!confirmed) return;

    try {
      // Show loading state
      const updatedInvestments = [];
      
      for (const inv of mutualFunds) {
        const updated = await refreshInvestmentNAV(inv);
        updatedInvestments.push(updated);
      }

      // Send to backend
      await api.refreshNAV(updatedInvestments);
      
      // Reload investments
      await fetchInvestments();
      
      alert(`Successfully refreshed NAV for ${updatedInvestments.length} investment(s)`);
    } catch (err) {
      alert('Error refreshing NAV: ' + err.message);
    }
  };

  // Save new or update existing investment
  const saveInvestment = async () => {
    // Validate: name and invested amount required
    if (!invForm.name || !invForm.invested) return;
    
    try {
      let units = parseFloat(invForm.units) || 0;
      let current = parseFloat(invForm.current) || parseFloat(invForm.invested);

      /* Auto NAV fetch commented out - using manual entry
      // If this is a mutual fund with scheme code, calculate units and current value
      if (invForm.type === 'Mutual Fund' && invForm.schemeCode && invForm.invested && invForm.date) {
        const purchaseNAV = await getNAVOnDate(invForm.schemeCode, invForm.date);
        if (purchaseNAV) {
          units = calculateUnits(parseFloat(invForm.invested), purchaseNAV);
          
          // If no current value entered, calculate it from current NAV
          if (!invForm.current) {
            const investmentData = await refreshInvestmentNAV({
              schemeCode: invForm.schemeCode,
              invested: parseFloat(invForm.invested),
              date: invForm.date,
              units: units
            });
            current = investmentData.current || current;
          }
        }
      }
      */

      const data = {
        name: invForm.name,
        type: invForm.type,
        invested: parseFloat(invForm.invested),
        current: current,
        date: invForm.date,
        schemeCode: String(invForm.schemeCode || ''),
        units: units
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
      alert('Error saving investment: ' + err.message);
    }
  };

  // Clear investment form and close it
  const resetInvForm = () => {
    setInvForm({ name: '', type: 'Mutual Fund', invested: '', current: '', date: today(), schemeCode: '', units: 0, currentNAV: '' });
    setEditingItem(null);
    setShowForm(null);
  };

  // Open form with existing data for editing
  const editInv = (inv) => {
    const currentNAV = inv.units > 0 ? (inv.current / inv.units).toFixed(2) : '';
    setInvForm({
      name: inv.name,
      type: inv.type,
      invested: String(inv.invested),
      current: String(inv.current),
      date: inv.date,
      schemeCode: inv.schemeCode || '',
      units: inv.units || 0,
      currentNAV: currentNAV
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
        addedBy: expForm.addedBy,
        paymentMethod: expForm.paymentMethod
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
    setExpForm({ desc: '', amount: '', category: 'Food', date: today(), addedBy: 'Ravi', paymentMethod: 'Online' });
    setEditingItem(null);
    setShowForm(null);
  };

  const editExp = (exp) => {
    setExpForm({
      desc: exp.desc,
      amount: String(exp.amount),
      category: exp.category,
      date: exp.date,
      addedBy: exp.addedBy || 'Ravi',
      paymentMethod: exp.paymentMethod || 'Online'
    });
    setEditingItem(exp.id);
    setShowForm('expense');
  };

  const deleteExp = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await deleteExpense(id);
  };

  // ----- INCOME FUNCTIONS -----

  const saveIncome = async () => {
    if (!incForm.source || !incForm.amount) return;
    
    try {
      const data = {
        source: incForm.source,
        amount: parseFloat(incForm.amount),
        category: incForm.category,
        date: incForm.date,
        addedBy: incForm.addedBy,
        paymentMethod: incForm.paymentMethod
      };
      
      if (editingItem) {
        await updateIncome(editingItem, data);
      } else {
        await addIncome(data);
      }
      resetIncForm();
    } catch (err) {
      console.error('Error saving income:', err);
      alert('Error saving income: ' + (err.message || err));
    }
  };

  const resetIncForm = () => {
    setIncForm({ source: '', amount: '', category: 'Salary', date: today(), addedBy: 'Ravi', paymentMethod: 'Online' });
    setEditingItem(null);
    setShowForm(null);
  };

  const editInc = (inc) => {
    setIncForm({
      source: inc.source,
      amount: String(inc.amount),
      category: inc.category,
      date: inc.date,
      addedBy: inc.addedBy || 'Ravi',
      paymentMethod: inc.paymentMethod || 'Online'
    });
    setEditingItem(inc.id);
    setShowForm('income');
  };

  const deleteInc = async (id) => {
    if (!confirm('Delete this income?')) return;
    await deleteIncome(id);
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
  const incArray = Array.isArray(incomes) ? incomes : [];
  
  // Current month expenses for Expenses tab
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExp = expArray.filter(e => e.date?.startsWith(currentMonth));
  const totalMonthly = monthlyExp.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Show loading state
  if (isInitialLoading) return <LoadingSpinner message="Loading your financial data..." />;

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

      {/* Display any errors as banner notifications */}
      {globalError && (
        <div style={{ padding: '0 2rem', paddingTop: '1rem' }}>
          <ErrorMessage 
            message={globalError} 
            onRetry={loadData}
          />
        </div>
      )}
      {(investmentsError || expensesError || settingsError) && !globalError && (
        <div style={{ padding: '0 2rem', paddingTop: '1rem' }}>
          <ErrorMessage 
            message={investmentsError || expensesError || settingsError}
          />
        </div>
      )}

      {/* MAIN CONTENT */}
      <main>
        {/* ===== DASHBOARD TAB ===== */}
        {tab === 'dashboard' && (
          <Dashboard 
            investments={investments}
            incomes={incomes}
            expenses={expenses}
            members={settings?.members || []}
          />
        )}

        {/* ===== INVESTMENTS TAB ===== */}
        {tab === 'investments' && (
          <div className="list-view">
            {/* Month Filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <label style={{ fontWeight: 500, color: '#667eea' }}>Filter by Month:</label>
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '0.375rem', cursor: 'pointer' }}
              />
            </div>

            <button className="add-btn" onClick={() => setShowForm('investment')}>
              + Add Investment
            </button>
            
            {/* Refresh NAV feature commented out - using manual entry instead
            <button 
              className="primary" 
              onClick={handleRefreshNAV}
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem'
              }}
            >
              🔄 Refresh NAV
            </button>
            */}

            {/* Investment Form */}
            {showForm === 'investment' && (
              <div className="form card">
                <AutocompleteInput
                  value={invForm.name}
                  onChange={e => setInvForm({...invForm, name: e.target.value, schemeCode: ''})}
                  onSelect={(fund) => {
                    // Handle both API results and manual entries
                    if (fund.isManual) {
                      setInvForm({...invForm, name: fund.schemeName, schemeCode: ''});
                    } else {
                      setInvForm({...invForm, name: fund.schemeName, schemeCode: fund.schemeCode || ''});
                    }
                  }}
                  placeholder="Search mutual fund (e.g., HDFC Flexi Cap, Nifty 50 Index)"
                  searchFunction={searchMutualFunds}
                  displayKey="schemeName"
                  minChars={3}
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
                
                {/* Manual NAV and Units Entry for Mutual Funds */}
                {invForm.type === 'Mutual Fund' && (
                  <div className="grid-2" style={{ marginTop: '1rem' }}>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Units (e.g., 425.41)"
                      value={invForm.units || ''}
                      onChange={e => setInvForm({...invForm, units: e.target.value})}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Current NAV ₹ (optional)"
                      value={invForm.currentNAV || ''}
                      onChange={e => {
                        const nav = e.target.value;
                        const units = invForm.units;
                        setInvForm({
                          ...invForm, 
                          currentNAV: nav,
                          // Auto-calculate current value if both NAV and units are provided
                          current: (nav && units) ? (parseFloat(nav) * parseFloat(units)).toFixed(2) : invForm.current
                        });
                      }}
                    />
                  </div>
                )}
                
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
              {invArray
                .filter(inv => inv.date?.startsWith(selectedMonth))
                .map(inv => {
                const currentNAV = inv.units && inv.units > 0 ? (inv.current / inv.units) : null;
                const purchaseNAV = inv.units && inv.units > 0 ? (inv.invested / inv.units) : null;
                
                // Debug logging
                console.log('Investment:', inv.name, 'Units:', inv.units, 'SchemeCode:', inv.schemeCode);
                
                return (
                  <div key={inv.id} className="card item">
                    <div className="item-header">
                      <div>
                        <h4>{inv.name}</h4>
                        <small>{inv.type} • {inv.date}</small>
                        {inv.schemeCode && <small style={{display: 'block', color: '#667eea'}}> Scheme: {inv.schemeCode}</small>}
                      </div>
                      <div className="item-actions">
                        <button onClick={() => editInv(inv)}>Edit</button>
                        <button className="danger" onClick={() => deleteInv(inv.id)}>Del</button>
                      </div>
                    </div>
                    
                    {/* NAV and Units Information */}
                    {inv.type === 'Mutual Fund' && inv.units && inv.units > 0 && (
                      <div className="nav-info">
                        <div className="nav-item">
                          <span className="nav-label">Units:</span>
                          <span className="nav-value">{inv.units.toFixed(3)}</span>
                        </div>
                        {purchaseNAV && (
                          <div className="nav-item">
                            <span className="nav-label">Purchase NAV:</span>
                            <span className="nav-value">{fmt(purchaseNAV)}</span>
                          </div>
                        )}
                        {currentNAV && (
                          <div className="nav-item">
                            <span className="nav-label">Current NAV:</span>
                            <span className="nav-value">{fmt(currentNAV)}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="item-footer">
                      <span>{fmt(inv.invested)} → {fmt(inv.current)}</span>
                      <span className={inv.current >= inv.invested ? 'gain' : 'loss'}>
                        {inv.current >= inv.invested ? '+' : ''}
                        {fmt(inv.current - inv.invested)} (
                        {((inv.current - inv.invested) / inv.invested * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== INCOME TAB ===== */}
        {tab === 'income' && (
          <div className="list-view">
            {/* Month Filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <label style={{ fontWeight: 500, color: '#667eea' }}>Filter by Month:</label>
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '0.375rem', cursor: 'pointer' }}
              />
            </div>

            {/* Total Income Summary */}
            <div className="card center">
              <span className="label">Total Income ({selectedMonth})</span>
              <span className="value gain">{fmt(incArray.filter(inc => inc.date?.startsWith(selectedMonth)).reduce((sum, inc) => sum + inc.amount, 0))}</span>
            </div>

            <button className="add-btn" onClick={() => setShowForm('income')}>
              + Add Income
            </button>

            {/* Income Form */}
            {showForm === 'income' && (
              <div className="form card">
                <input
                  placeholder="Source (e.g., Salary, Freelance)"
                  value={incForm.source}
                  onChange={e => setIncForm({...incForm, source: e.target.value})}
                />
                <div className="grid-2">
                  <input
                    type="number"
                    placeholder="Amount ₹"
                    value={incForm.amount}
                    onChange={e => setIncForm({...incForm, amount: e.target.value})}
                  />
                  <select
                    value={incForm.category}
                    onChange={e => setIncForm({...incForm, category: e.target.value})}
                  >
                    {settings?.incomeCategories?.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select
                    value={incForm.addedBy}
                    onChange={e => setIncForm({...incForm, addedBy: e.target.value})}
                  >
                    {settings?.members?.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <select
                    value={incForm.paymentMethod}
                    onChange={e => setIncForm({...incForm, paymentMethod: e.target.value})}
                  >
                    {settings?.paymentMethods?.map(pm => <option key={pm}>{pm}</option>)}
                  </select>
                  <input
                    type="date"
                    value={incForm.date}
                    onChange={e => setIncForm({...incForm, date: e.target.value})}
                  />
                </div>
                <div className="btn-row">
                  <button className="primary" onClick={saveIncome}>
                    {editingItem ? 'Update' : 'Save'}
                  </button>
                  <button onClick={resetIncForm}>Cancel</button>
                </div>
              </div>
            )}

            {/* Income List */}
            <div className="items-grid">
              {incArray
                .filter(inc => inc.date?.startsWith(selectedMonth))
                .sort((a, b) => b.date?.localeCompare(a.date)) // Newest first
                .map(inc => (
                  <div key={inc.id} className="card item">
                    <div className="item-header">
                      <div>
                        <h4>{inc.source}</h4>
                        <small>{inc.date} • {inc.category} • {inc.paymentMethod || 'N/A'} • {inc.addedBy}</small>
                      </div>
                      <div className="item-actions">
                        <span className="amount gain">+{fmt(inc.amount)}</span>
                        <button onClick={() => editInc(inc)}>Edit</button>
                        <button className="danger" onClick={() => deleteInc(inc.id)}>Del</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ===== EXPENSES TAB ===== */}
        {tab === 'expenses' && (
          <div className="list-view">
            {/* Month Filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <label style={{ fontWeight: 500, color: '#667eea' }}>Filter by Month:</label>
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '0.375rem', cursor: 'pointer' }}
              />
            </div>

            {/* Monthly Total */}
            <div className="card center">
              <span className="label">{selectedMonth}</span>
              <span className="value loss">{fmt(expArray.filter(e => e.date?.startsWith(selectedMonth)).reduce((sum, e) => sum + (e.amount || 0), 0))}</span>
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
                  <select
                    value={expForm.paymentMethod}
                    onChange={e => setExpForm({...expForm, paymentMethod: e.target.value})}
                  >
                    {settings?.paymentMethods?.map(pm => <option key={pm}>{pm}</option>)}
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
                .filter(exp => exp.date?.startsWith(selectedMonth))
                .sort((a, b) => b.date?.localeCompare(a.date)) // Newest first
                .map(exp => (
                  <div key={exp.id} className="card item">
                    <div className="item-header">
                      <div>
                        <h4>{exp.desc}</h4>
                        <small>{exp.date} • {exp.category} • {exp.paymentMethod || 'N/A'} • {exp.addedBy}</small>
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
