import { useState } from 'react';
import { SummaryView } from './SummaryView';
import { AnalyticsView } from './AnalyticsView';
import './Dashboard.css';

export const Dashboard = ({ investments, incomes, expenses }) => {
  const [activeView, setActiveView] = useState('summary'); // 'summary' or 'analytics'

  return (
    <div className="dashboard">
      {/* View Toggle Tabs */}
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

      {/* Render Active View */}
      <div className="dashboard-content">
        {activeView === 'summary' ? (
          <SummaryView investments={investments} incomes={incomes} expenses={expenses} />
        ) : (
          <AnalyticsView investments={investments} incomes={incomes} expenses={expenses} />
        )}
      </div>
    </div>
  );
};
