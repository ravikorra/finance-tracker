import { useState } from 'react';
import { SummaryView } from './SummaryView';
import { AnalyticsView } from './AnalyticsView';
import './Dashboard.css';

export const Dashboard = ({ investments, incomes, expenses, members = [] }) => {
  const [activeView, setActiveView] = useState('summary'); // 'summary' or 'analytics'
  
  // Get current month in YYYY-MM format
  const getCurrentMonthString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());

  return (
    <div className="dashboard">
      {/* View Toggle Tabs and Month Filter */}
      <div className="dashboard-header">
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeView === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveView('summary')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">Summary</span>
          </button>
          <button
            className={`tab-button ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            <span className="tab-icon">📈</span>
            <span className="tab-label">Analytics</span>
          </button>
        </div>

        {/* Month/Year Filter */}
        <div className="month-filter">
          <label>Filter by Month:</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Render Active View */}
      <div className="dashboard-content">
        {activeView === 'summary' ? (
          <SummaryView 
            investments={investments} 
            incomes={incomes} 
            expenses={expenses}
            selectedMonth={selectedMonth}
          />
        ) : (
          <AnalyticsView 
            investments={investments} 
            incomes={incomes} 
            expenses={expenses}
            selectedMonth={selectedMonth}
          />
        )}
      </div>
    </div>
  );
};
